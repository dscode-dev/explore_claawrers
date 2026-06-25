"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Database,
  Server,
  Download,
  StopCircle,
} from "lucide-react";

// Interfaces espelhando os contratos e o BullMQ
interface JobStatus {
  id: string;
  source: string;
  league: string;
  status: "active" | "waiting" | "completed" | "failed";
  progress: number;
}

interface DatasetSummary {
  filename: string;
  category: string;
  source: string;
  timestamp: string;
}

export default function CommandCenter() {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [newCrawlerTarget, setNewCrawlerTarget] = useState({
    source: "fbref",
    league: "PREMIER_LEAGUE",
  });

  useEffect(() => {
    fetchDatasets();
    fetchActiveJobs();

    const interval = setInterval(() => {
      fetchActiveJobs();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await fetch("http://crawler-engine/api/datasets");
      if (response.ok) setDatasets(await response.json());
    } catch (e) {}
  };

  const fetchActiveJobs = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/crawlers/status`,
      );
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Falha ao buscar status dos workers", error);
    }
  };

  const handleCreateCrawler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/crawlers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCrawlerTarget),
        },
      );

      if (response.ok) {
        setIsFormOpen(false);
        fetchActiveJobs();
      }
    } catch (error) {
      console.error("Falha ao despachar crawler", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "waiting":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "completed":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Ações */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
              <Activity className="text-indigo-600" /> Crawler Command Center
            </h1>
            <p className="text-slate-500 mt-1">
              Gerenciamento de ingestão, workers e fila de processamento.
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm"
          >
            <Plus size={18} /> Novo Crawler
          </button>
        </header>

        {/* Painel de Novo Crawler (Expansível) */}
        {isFormOpen && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              Configurar Nova Extração
            </h2>
            <form
              onSubmit={handleCreateCrawler}
              className="flex gap-4 items-end"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fonte de Dados
                </label>
                <select
                  className="w-full border-slate-200 rounded-lg p-2.5 bg-slate-50 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={newCrawlerTarget.source}
                  onChange={(e) =>
                    setNewCrawlerTarget({
                      ...newCrawlerTarget,
                      source: e.target.value,
                    })
                  }
                >
                  <option value="fbref">FBref (Estatísticas Avançadas)</option>
                  <option value="sofascore">SofaScore (Behaviors)</option>
                  <option value="football-data">Football-Data (Odds)</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Competição
                </label>
                <select
                  className="w-full border-slate-200 rounded-lg p-2.5 bg-slate-50 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={newCrawlerTarget.league}
                  onChange={(e) =>
                    setNewCrawlerTarget({
                      ...newCrawlerTarget,
                      league: e.target.value,
                    })
                  }
                >
                  <option value="PREMIER_LEAGUE">Premier League</option>
                  <option value="BRASILEIRAO_SERIE_A">
                    Brasileirão Série A
                  </option>
                  <option value="COPA_LIBERTADORES">Copa Libertadores</option>
                  <option value="UEFA_CHAMPIONS_LEAGUE">
                    Champions League
                  </option>
                </select>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
              >
                <Play size={16} /> Disparar Worker
              </button>
            </form>
          </div>
        )}

        {/* Tabela de Workers Ativos (Fila BullMQ) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Server size={20} className="text-slate-500" /> Fila de
              Processamento Ativa
            </h2>
            <span className="text-sm bg-slate-200 text-slate-700 px-3 py-1 rounded-full font-medium">
              {jobs.length} na fila
            </span>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="p-4 font-semibold">ID / Job</th>
                <th className="p-4 font-semibold">Alvo</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold w-1/3">Progresso</th>
                <th className="p-4 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 font-mono text-xs text-slate-500">
                    {job.id}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900 capitalize">
                      {job.source}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {job.league.replace(/_/g, " ")}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border uppercase tracking-wider ${getStatusColor(job.status)}`}
                    >
                      {job.status === "active" && (
                        <Activity size={12} className="animate-pulse" />
                      )}
                      {job.status === "waiting" && <Clock size={12} />}
                      {job.status === "failed" && <AlertCircle size={12} />}
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${job.status === "failed" ? "bg-red-500" : "bg-indigo-500"}`}
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-slate-500 w-8">
                        {job.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {job.status === "active" || job.status === "waiting" ? (
                      <button
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Cancelar Job"
                      >
                        <StopCircle size={18} />
                      </button>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Tabela de Datasets (Simplificada para dar espaço) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Database size={20} className="text-slate-500" /> Datasets
              Consolidados (NDJSON)
            </h2>
          </div>
          {/* ... A tabela de Datasets feita no passo anterior entra aqui ... */}
          <div className="p-8 text-center text-slate-500 text-sm">
            Tabela de arquivos pronta para ser conectada. (Vide passo anterior).
          </div>
        </section>
      </div>
    </div>
  );
}
