import { useEffect, useMemo, useState } from "react"

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000"

const emptyState = {
  scholars: [],
  issues: [],
  madzhabs: [],
  loading: true,
  error: null
}

const formatStatus = (status) => {
  if (!status) return "-"
  return status.replaceAll("_", " ")
}

export default function App() {
  const [data, setData] = useState(emptyState)
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedIssueId, setSelectedIssueId] = useState("")
  const [opinions, setOpinions] = useState([])
  const [opinionsLoading, setOpinionsLoading] = useState(false)
  const [activeCrud, setActiveCrud] = useState("scholars")
  const [crudLoading, setCrudLoading] = useState(false)
  const [crudError, setCrudError] = useState("")
  const [editScholarId, setEditScholarId] = useState("")
  const [editIssueId, setEditIssueId] = useState("")
  const [scholarForm, setScholarForm] = useState({
    name: "",
    madzhab: "",
    type: "individual"
  })
  const [issueForm, setIssueForm] = useState({
    title: "",
    description: "",
    status: "belum_diketahui_khilaf",
    asbabAlKhilaf: ""
  })

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const [scholarsRes, issuesRes, madzhabsRes] = await Promise.all([
          fetch(`${API_BASE}/scholars`),
          fetch(`${API_BASE}/issues`),
          fetch(`${API_BASE}/madzhabs`)
        ])

        if (!scholarsRes.ok || !issuesRes.ok || !madzhabsRes.ok) {
          throw new Error("Gagal memuat data utama dari server.")
        }

        const [scholars, issues, madzhabs] = await Promise.all([
          scholarsRes.json(),
          issuesRes.json(),
          madzhabsRes.json()
        ])

        if (active) {
          setData({ scholars, issues, madzhabs, loading: false, error: null })
        }
      } catch (error) {
        if (active) {
          setData((prev) => ({ ...prev, loading: false, error: error.message }))
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/issues/search?q=${encodeURIComponent(query.trim())}`
        )

        if (!res.ok) {
          throw new Error("Pencarian gagal.")
        }

        const result = await res.json()
        setSearchResults(result)
      } catch (error) {
        setSearchResults([])
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!selectedIssueId) {
      setOpinions([])
      return
    }

    let active = true
    setOpinionsLoading(true)

    const loadOpinions = async () => {
      try {
        const res = await fetch(`${API_BASE}/issues/${selectedIssueId}/opinions`)
        if (!res.ok) {
          throw new Error("Gagal memuat opini.")
        }
        const result = await res.json()
        if (active) {
          setOpinions(result)
        }
      } catch (error) {
        if (active) {
          setOpinions([])
        }
      } finally {
        if (active) {
          setOpinionsLoading(false)
        }
      }
    }

    loadOpinions()

    return () => {
      active = false
    }
  }, [selectedIssueId])

  const stats = useMemo(
    () => [
      { label: "Scholars", value: data.scholars.length },
      { label: "Legal Issues", value: data.issues.length },
      { label: "Madzhabs", value: data.madzhabs.length }
    ],
    [data]
  )

  const refreshData = async () => {
    try {
      const [scholarsRes, issuesRes, madzhabsRes] = await Promise.all([
        fetch(`${API_BASE}/scholars`),
        fetch(`${API_BASE}/issues`),
        fetch(`${API_BASE}/madzhabs`)
      ])
      if (!scholarsRes.ok || !issuesRes.ok || !madzhabsRes.ok) {
        throw new Error("Gagal memuat ulang data.")
      }
      const [scholars, issues, madzhabs] = await Promise.all([
        scholarsRes.json(),
        issuesRes.json(),
        madzhabsRes.json()
      ])
      setData({ scholars, issues, madzhabs, loading: false, error: null })
    } catch (error) {
      setData((prev) => ({ ...prev, error: error.message }))
    }
  }

  const resetScholarForm = () => {
    setScholarForm({ name: "", madzhab: "", type: "individual" })
    setEditScholarId("")
  }

  const resetIssueForm = () => {
    setIssueForm({
      title: "",
      description: "",
      status: "belum_diketahui_khilaf",
      asbabAlKhilaf: ""
    })
    setEditIssueId("")
  }

  const handleScholarSubmit = async (event) => {
    event.preventDefault()
    setCrudLoading(true)
    setCrudError("")
    try {
      const payload = {
        name: scholarForm.name.trim(),
        madzhab: scholarForm.madzhab.trim() || null,
        type: scholarForm.type
      }
      if (!payload.name) {
        throw new Error("Nama scholar wajib diisi.")
      }
      const method = editScholarId ? "PUT" : "POST"
      const url = editScholarId
        ? `${API_BASE}/scholars/${editScholarId}`
        : `${API_BASE}/scholars`

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const message = await res.text()
        throw new Error(message || "Gagal menyimpan scholar.")
      }
      await refreshData()
      resetScholarForm()
    } catch (error) {
      setCrudError(error.message)
    } finally {
      setCrudLoading(false)
    }
  }

  const handleIssueSubmit = async (event) => {
    event.preventDefault()
    setCrudLoading(true)
    setCrudError("")
    try {
      const payload = {
        title: issueForm.title.trim(),
        description: issueForm.description.trim() || null,
        status: issueForm.status,
        asbabAlKhilaf: issueForm.asbabAlKhilaf.trim() || null
      }
      if (!payload.title) {
        throw new Error("Judul issue wajib diisi.")
      }
      const method = editIssueId ? "PATCH" : "POST"
      const url = editIssueId
        ? `${API_BASE}/issues/${editIssueId}`
        : `${API_BASE}/issues`

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const message = await res.text()
        throw new Error(message || "Gagal menyimpan legal issue.")
      }
      await refreshData()
      resetIssueForm()
    } catch (error) {
      setCrudError(error.message)
    } finally {
      setCrudLoading(false)
    }
  }

  const handleScholarDelete = async (id) => {
    if (!id) return
    setCrudLoading(true)
    setCrudError("")
    try {
      const res = await fetch(`${API_BASE}/scholars/${id}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        const message = await res.text()
        throw new Error(message || "Gagal menghapus scholar.")
      }
      await refreshData()
      if (editScholarId === id) resetScholarForm()
    } catch (error) {
      setCrudError(error.message)
    } finally {
      setCrudLoading(false)
    }
  }

  const handleIssueDelete = async (id) => {
    if (!id) return
    setCrudLoading(true)
    setCrudError("")
    try {
      const res = await fetch(`${API_BASE}/issues/${id}`, {
        method: "DELETE"
      })
      if (!res.ok) {
        const message = await res.text()
        throw new Error(message || "Gagal menghapus legal issue.")
      }
      await refreshData()
      if (editIssueId === id) resetIssueForm()
    } catch (error) {
      setCrudError(error.message)
    } finally {
      setCrudLoading(false)
    }
  }

  const startEditScholar = (item) => {
    setActiveCrud("scholars")
    setEditScholarId(item._id)
    setScholarForm({
      name: item.name || "",
      madzhab: item.madzhab || "",
      type: item.type || "individual"
    })
  }

  const startEditIssue = (item) => {
    setActiveCrud("issues")
    setEditIssueId(item._id)
    setIssueForm({
      title: item.title || "",
      description: item.description || "",
      status: item.status || "belum_diketahui_khilaf",
      asbabAlKhilaf: item.asbabAlKhilaf || ""
    })
  }

  return (
    <div className="text-ink">
      <header className="section-shell pt-10">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-ink text-white grid place-items-center text-sm font-semibold shadow-soft">
              SP
            </div>
            <div>
              <p className="text-sm font-semibold">StudProject</p>
              <p className="text-xs text-mute">Frontend Studio</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-mute">
            <a className="hover:text-ink" href="#data">Data</a>
            <a className="hover:text-ink" href="#crud">CRUD</a>
            <a className="hover:text-ink" href="#search">Pencarian</a>
            <a className="hover:text-ink" href="#opinions">Opini</a>
          </div>
          <span className="badge">API: {API_BASE}</span>
        </nav>
      </header>

      <main className="section-shell pb-20">
        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center pt-14">
          <div className="stagger">
            <span className="badge">Frontend Modern</span>
            <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl leading-tight mt-4">
              Antarmuka simple, modern, dan clean untuk data fikih.
            </h1>
            <p className="text-mute text-lg mt-4 max-w-xl">
              Terhubung langsung ke backend studproject untuk menampilkan scholar, legal issue,
              dan madzhab secara konsisten. Semua data real-time dari API.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <button className="btn-primary">Lihat Dokumentasi</button>
              <button className="btn-ghost">Tambah Endpoint</button>
            </div>
            <div className="flex gap-6 mt-8">
              {stats.map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-semibold">{item.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-mute">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[32px] p-6 md:p-8 shadow-soft">
            <div className="flex items-center justify-between text-xs text-mute">
              <span>Status Sistem</span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Online
              </span>
            </div>
            <div className="mt-6 space-y-4">
              <div className="card bg-white/70">
                <p className="text-sm font-semibold">Koneksi API</p>
                <p className="text-3xl font-semibold mt-2">
                  {data.error ? "Error" : data.loading ? "Loading" : "Ready"}
                </p>
                <p className="text-xs text-mute mt-1">
                  {data.error || "Terhubung ke MongoDB via Express"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="card bg-white/70">
                  <p className="text-sm font-semibold">Scholars</p>
                  <p className="text-2xl font-semibold mt-2">
                    {data.scholars.length}
                  </p>
                  <p className="text-xs text-mute mt-1">Total terdata</p>
                </div>
                <div className="card bg-white/70">
                  <p className="text-sm font-semibold">Legal Issues</p>
                  <p className="text-2xl font-semibold mt-2">
                    {data.issues.length}
                  </p>
                  <p className="text-xs text-mute mt-1">Total terdata</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="data" className="mt-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="badge">Data Utama</p>
              <h2 className="hero-title text-3xl md:text-4xl mt-4">
                Ringkasan konten dari API.
              </h2>
            </div>
            <p className="text-mute max-w-md">
              Menampilkan scholar, legal issue, dan madzhab terbaru untuk memudahkan validasi data.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mt-10">
            <div className="card bg-white/80">
              <h3 className="text-lg font-semibold">Scholars</h3>
              <p className="text-sm text-mute mt-2">
                Total {data.scholars.length} data.
              </p>
              <div className="mt-4 space-y-3 text-sm">
                {(data.scholars || []).slice(0, 4).map((item) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-mute">{item.madzhab || "-"}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-mute">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card bg-white/80">
              <h3 className="text-lg font-semibold">Legal Issues</h3>
              <p className="text-sm text-mute mt-2">
                Total {data.issues.length} isu.
              </p>
              <div className="mt-4 space-y-3 text-sm">
                {(data.issues || []).slice(0, 4).map((item) => (
                  <div key={item._id}>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-mute">Status: {formatStatus(item.status)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card bg-white/80">
              <h3 className="text-lg font-semibold">Madzhab</h3>
              <p className="text-sm text-mute mt-2">
                Total {data.madzhabs.length} madzhab.
              </p>
              <div className="mt-4 space-y-3 text-sm">
                {(data.madzhabs || []).slice(0, 4).map((item) => (
                  <div key={item._id}>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-mute">
                      Founder: {item.founder?.name || "-"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="crud" className="mt-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="badge">CRUD</p>
              <h2 className="hero-title text-3xl md:text-4xl mt-4">
                Kelola data scholar dan legal issue langsung dari UI.
              </h2>
            </div>
            <p className="text-mute max-w-md">
              Form ini langsung terhubung ke endpoint backend. Semua perubahan akan tampil di ringkasan data.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className={activeCrud === "scholars" ? "btn-primary" : "btn-ghost"}
              onClick={() => setActiveCrud("scholars")}
            >
              Scholars
            </button>
            <button
              className={activeCrud === "issues" ? "btn-primary" : "btn-ghost"}
              onClick={() => setActiveCrud("issues")}
            >
              Legal Issues
            </button>
          </div>

          <div className="mt-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-10">
            <div className="card bg-white/80">
              {activeCrud === "scholars" && (
                <form onSubmit={handleScholarSubmit} className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {editScholarId ? "Edit Scholar" : "Tambah Scholar"}
                    </h3>
                    {editScholarId && (
                      <button
                        type="button"
                        className="text-xs text-mute underline"
                        onClick={resetScholarForm}
                      >
                        Batal edit
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-mute">
                      Nama
                    </label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm"
                      value={scholarForm.name}
                      onChange={(event) =>
                        setScholarForm((prev) => ({
                          ...prev,
                          name: event.target.value
                        }))
                      }
                      placeholder="Nama scholar"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-mute">
                      Madzhab
                    </label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm"
                      value={scholarForm.madzhab}
                      onChange={(event) =>
                        setScholarForm((prev) => ({
                          ...prev,
                          madzhab: event.target.value
                        }))
                      }
                      placeholder="Contoh: Syafii"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-mute">
                      Tipe
                    </label>
                    <select
                      className="mt-2 w-full rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm"
                      value={scholarForm.type}
                      onChange={(event) =>
                        setScholarForm((prev) => ({
                          ...prev,
                          type: event.target.value
                        }))
                      }
                    >
                      <option value="individual">individual</option>
                      <option value="institution">institution</option>
                    </select>
                  </div>
                  {crudError && (
                    <p className="text-xs text-red-600">{crudError}</p>
                  )}
                  <button className="btn-primary" disabled={crudLoading}>
                    {crudLoading ? "Menyimpan..." : "Simpan Scholar"}
                  </button>
                </form>
              )}

              {activeCrud === "issues" && (
                <form onSubmit={handleIssueSubmit} className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {editIssueId ? "Edit Legal Issue" : "Tambah Legal Issue"}
                    </h3>
                    {editIssueId && (
                      <button
                        type="button"
                        className="text-xs text-mute underline"
                        onClick={resetIssueForm}
                      >
                        Batal edit
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-mute">
                      Judul
                    </label>
                    <input
                      className="mt-2 w-full rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm"
                      value={issueForm.title}
                      onChange={(event) =>
                        setIssueForm((prev) => ({
                          ...prev,
                          title: event.target.value
                        }))
                      }
                      placeholder="Judul issue"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-mute">
                      Deskripsi
                    </label>
                    <textarea
                      className="mt-2 w-full min-h-[120px] rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm"
                      value={issueForm.description}
                      onChange={(event) =>
                        setIssueForm((prev) => ({
                          ...prev,
                          description: event.target.value
                        }))
                      }
                      placeholder="Deskripsi singkat"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-mute">
                        Status
                      </label>
                      <select
                        className="mt-2 w-full rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm"
                        value={issueForm.status}
                        onChange={(event) =>
                          setIssueForm((prev) => ({
                            ...prev,
                            status: event.target.value
                          }))
                        }
                      >
                        <option value="belum_diketahui_khilaf">
                          belum_diketahui_khilaf
                        </option>
                        <option value="ikhtilaf">ikhtilaf</option>
                        <option value="ijma">ijma</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.2em] text-mute">
                        Asbab Al Khilaf
                      </label>
                      <input
                        className="mt-2 w-full rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm"
                        value={issueForm.asbabAlKhilaf}
                        onChange={(event) =>
                          setIssueForm((prev) => ({
                            ...prev,
                            asbabAlKhilaf: event.target.value
                          }))
                        }
                        placeholder="Opsional"
                      />
                    </div>
                  </div>
                  {crudError && (
                    <p className="text-xs text-red-600">{crudError}</p>
                  )}
                  <button className="btn-primary" disabled={crudLoading}>
                    {crudLoading ? "Menyimpan..." : "Simpan Legal Issue"}
                  </button>
                </form>
              )}
            </div>

            <div className="card bg-white/80">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {activeCrud === "scholars" ? "Daftar Scholar" : "Daftar Legal Issue"}
                </h3>
                <button className="btn-ghost" onClick={refreshData}>
                  Refresh
                </button>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                {activeCrud === "scholars" &&
                  data.scholars.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-ink/10 bg-white/70 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-mute">
                          {item.madzhab || "-"} | {item.type}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn-ghost"
                          onClick={() => startEditScholar(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-ghost"
                          onClick={() => handleScholarDelete(item._id)}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}

                {activeCrud === "issues" &&
                  data.issues.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-ink/10 bg-white/70 px-4 py-3"
                    >
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-xs text-mute">
                          Status: {formatStatus(item.status)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn-ghost"
                          onClick={() => startEditIssue(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-ghost"
                          onClick={() => handleIssueDelete(item._id)}
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}

                {activeCrud === "scholars" && data.scholars.length === 0 && (
                  <p className="text-xs text-mute">Belum ada scholar.</p>
                )}
                {activeCrud === "issues" && data.issues.length === 0 && (
                  <p className="text-xs text-mute">Belum ada legal issue.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="search" className="mt-20 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <div className="card bg-white/70">
            <p className="text-sm font-semibold">Search Legal Issue</p>
            <p className="text-xs text-mute mt-1">
              Masukkan kata kunci untuk mencari isu berdasarkan index text MongoDB.
            </p>
            <input
              className="mt-4 w-full rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ink/20"
              placeholder="Contoh: nikah, zakat, talak"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="mt-6 space-y-3 text-sm text-mute">
              {(searchResults || []).length === 0 && query.length > 1 && (
                <p>Hasil pencarian kosong.</p>
              )}
              {(searchResults || []).slice(0, 5).map((item) => (
                <div key={item._id}>
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="text-xs text-mute">{item.description || "-"}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="badge">Insight</p>
            <h2 className="hero-title text-3xl md:text-4xl mt-4">
              Temukan isu dan opini secara cepat.
            </h2>
            <p className="text-mute mt-4">
              Gunakan dropdown untuk melihat daftar opini berdasarkan legal issue yang dipilih.
            </p>
            <div className="mt-6">
              <label className="text-xs uppercase tracking-[0.2em] text-mute">
                Pilih Legal Issue
              </label>
              <select
                className="mt-2 w-full rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm"
                value={selectedIssueId}
                onChange={(event) => setSelectedIssueId(event.target.value)}
              >
                <option value="">Pilih isu</option>
                {(data.issues || []).map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section id="opinions" className="mt-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="badge">Opini Ulama</p>
              <h2 className="hero-title text-3xl md:text-4xl mt-4">
                Ringkasan opini untuk legal issue terpilih.
              </h2>
            </div>
            <p className="text-mute max-w-md">
              Data diambil dari endpoint issues/:issueId/opinions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            {opinionsLoading && (
              <div className="card bg-white/80">
                <p className="text-sm text-mute">Memuat opini...</p>
              </div>
            )}
            {!opinionsLoading && opinions.length === 0 && (
              <div className="card bg-white/80">
                <p className="text-sm text-mute">Belum ada opini untuk isu ini.</p>
              </div>
            )}
            {opinions.map((item) => (
              <div key={item._id} className="card bg-white/80">
                <div className="flex items-center justify-between text-xs text-mute">
                  <span>{item.type}</span>
                  <span>{item.phase || "-"}</span>
                </div>
                <h3 className="text-lg font-semibold mt-2">
                  {item.scholarId?.name || "Scholar"}
                </h3>
                <p className="text-sm text-mute mt-1">
                  {item.rulingCategory}: {item.rulingValue}
                </p>
                <p className="text-sm mt-3">{item.summary || "-"}</p>
                <p className="text-xs text-mute mt-3">Dalil: {item.dalil || "-"}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="section-shell pb-10 text-sm text-mute">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-ink/10 pt-6">
          <p>© 2026 StudProject. Semua hak dilindungi.</p>
          <div className="flex items-center gap-6">
            <span>Docs</span>
            <span>Status</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
