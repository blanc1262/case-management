import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CaseGroup, CaseRow, User, SystemBackup } from "../types";
import { Daisy } from "./Daisy";
import {
  Menu,
  X,
  ChevronDown,
  Home,
  Settings,
  LogOut,
  Database,
  User as UserIcon,
  Folder,
  Upload,
  Trash2,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Filter,
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";

export const Dashboard: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<
    "home" | "cases" | "system" | "accounts" | "tracking"
  >("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState<string>("");
  const [years, setYears] = useState<string[]>([]);
  const [cases, setCases] = useState<CaseGroup[]>([]);
  const [filterTerm, setFilterTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [editingGroup, setEditingGroup] = useState<CaseGroup | null>(null);
  const [modalType, setModalType] = useState<
    "alert" | "confirm" | "prompt" | "editor" | null
  >(null);
  const [modalMessage, setModalMessage] = useState("");
  const [modalResolve, setModalResolve] = useState<
    ((value: any) => void) | null
  >(null);
  const [promptValue, setPromptValue] = useState("");
  const [trackingYear, setTrackingYear] = useState<string>("");
  const [trackingMonth, setTrackingMonth] = useState<string>("");

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("loggedInUser");
    if (!userStr) {
      navigate("/");
      return;
    }
    const user = JSON.parse(userStr);
    setLoggedInUser(user);

    document.documentElement.classList.remove("dark");

    const storedYears = JSON.parse(localStorage.getItem("years") || "[]");
    setYears(storedYears);
    if (storedYears.length > 0) {
      setCurrentYear(storedYears[0]);
      loadCases(storedYears[0]);
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const loadCases = (year: string) => {
    const stored = localStorage.getItem(`cases_${year}`);
    const loadedCases = stored ? JSON.parse(stored) : [];
    setCases(loadedCases);
    setCurrentPage(1);
  };

  const showAlert = (msg: string) => {
    return new Promise((resolve) => {
      setModalType("alert");
      setModalMessage(msg);
      setModalResolve(() => resolve);
    });
  };

  const showConfirm = (msg: string) => {
    return new Promise((resolve) => {
      setModalType("confirm");
      setModalMessage(msg);
      setModalResolve(() => resolve);
    });
  };

  const showPrompt = (msg: string) => {
    return new Promise((resolve) => {
      setModalType("prompt");
      setModalMessage(msg);
      setPromptValue("");
      setModalResolve(() => resolve);
    });
  };

  const handleModalClose = (value: any) => {
    if (modalResolve) modalResolve(value);
    setModalType(null);
    setModalMessage("");
    setModalResolve(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  const handleAddYear = async () => {
    const newY = await showPrompt("Enter new year:");
    if (!newY || isNaN(Number(newY))) {
      if (newY !== null) showAlert("Please enter a valid year!");
      return;
    }
    if (years.includes(newY)) {
      showAlert("Year exists!");
      return;
    }
    const updatedYears = [...years, newY];
    setYears(updatedYears);
    localStorage.setItem("years", JSON.stringify(updatedYears));
  };

  const handleRemoveYear = async () => {
    const yRem = await showPrompt("Enter year to remove:");
    if (!yRem) return;
    if (!years.includes(yRem)) {
      showAlert("❌ That year does not exist.");
      return;
    }
    const confirmed = await showConfirm(
      `🛑 STOP & CAUTION! ⚠️\n\nAll data for the year ${yRem} will be PERMANENTLY lost.`,
    );
    if (confirmed) {
      const updatedYears = years.filter((y) => y !== yRem);
      setYears(updatedYears);
      localStorage.setItem("years", JSON.stringify(updatedYears));
      localStorage.removeItem(`cases_${yRem}`);
      if (currentYear === yRem) {
        setCurrentYear("");
        setCases([]);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingGroup) setEditingGroup(null);
        if (modalType) setModalType(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingGroup, modalType]);

  const highlightText = (text: string, term: string) => {
    if (!term || !text) return text;
    const regex = new RegExp(
      `(${term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`,
      "gi",
    );
    const parts = String(text).split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-rose-100 text-rose-700 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const isCsv = file.name.toLowerCase().endsWith(".csv");
      const delimiter = isCsv ? "," : "\t";

      const rawLines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
      const newGroups: CaseGroup[] = [];
      let currentBlock: CaseRow[] | null = null;

      // Simple CSV/TSV parser that handles basic quoting
      const parseLine = (line: string) => {
        const result = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      rawLines.forEach((line, index) => {
        const parts = parseLine(line);

        // Skip header if it looks like one
        if (
          index === 0 &&
          (parts[0].toLowerCase().includes("case") ||
            parts[2].toLowerCase().includes("name"))
        ) {
          return;
        }

        const rowData: CaseRow = {
          caseNo: (parts[0] || "").trim(),
          program: (parts[1] || "").trim(),
          name: parts[2] || "",
          address: parts[3] || "",
          filedCases: (parts[4] || "").trim(),
          complainant: parts[5] || "",
          nature: parts[6] || "",
          remarks: parts[7] || "",
          status: (parts[8] || "").trim().toUpperCase() as any,
        };

        if (!["DISMISSED", "PENDING", "RESOLVED"].includes(rowData.status)) {
          rowData.status = "PENDING";
        }

        if (rowData.caseNo !== "") {
          currentBlock = [rowData];
          newGroups.push(currentBlock);
        } else if (currentBlock) {
          currentBlock.push(rowData);
        }
      });

      const updatedCases = [...cases, ...newGroups];
      setCases(updatedCases);
      localStorage.setItem(
        `cases_${currentYear}`,
        JSON.stringify(updatedCases),
      );
      setCurrentPage(Math.max(1, Math.ceil(updatedCases.length / pageSize)));
      showAlert(`✅ Done! Imported ${newGroups.length} case blocks.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleRemoveAllCases = async () => {
    const confirmed = await showConfirm(
      `⚠️ WARNING: Clear ALL data for ${currentYear}?`,
    );
    if (confirmed) {
      setCases([]);
      localStorage.setItem(`cases_${currentYear}`, JSON.stringify([]));
      setCurrentPage(1);
    }
  };

  const handleBackup = () => {
    const data: SystemBackup = { years, cases: {} };
    years.forEach((y) => {
      data.cases[y] = localStorage.getItem(`cases_${y}`) || "[]";
    });
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `System_Backup_${new Date().toLocaleDateString()}.json`;
    a.click();
    showAlert("✅ Backup downloaded successfully!");
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data: SystemBackup = JSON.parse(evt.target?.result as string);
        const confirmed = await showConfirm(
          "Restore and overwrite current data?",
        );
        if (confirmed) {
          localStorage.setItem("years", JSON.stringify(data.years));
          Object.keys(data.cases).forEach((k) => {
            localStorage.setItem(`cases_${k}`, data.cases[k]);
          });
          showAlert("✅ Data restored! Reloading...");
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (err) {
        showAlert("❌ Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleChangePassword = async () => {
    const currentPassInput = await showPrompt("Enter current password:");
    if (currentPassInput === null) return;

    if (currentPassInput !== loggedInUser?.password) {
      showAlert("❌ Incorrect current password.");
      return;
    }

    const newPass = await showPrompt("Enter new password:");
    if (!newPass) return;

    const storedUsers = localStorage.getItem("accounts");
    let users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
    users = users.map((u) =>
      u.username === loggedInUser?.username
        ? { ...u, password: newPass as string }
        : u,
    );
    localStorage.setItem("accounts", JSON.stringify(users));
    const updatedUser = { ...loggedInUser!, password: newPass };
    setLoggedInUser(updatedUser);
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
    showAlert("✅ Password updated successfully!");
  };

  const handleDeleteAccount = async () => {
    const confirmed = await showConfirm("🛑 Permanently delete account?");
    if (confirmed) {
      const storedUsers = localStorage.getItem("accounts");
      let users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      users = users.filter((u) => u.username !== loggedInUser?.username);
      localStorage.setItem("accounts", JSON.stringify(users));
      localStorage.removeItem("loggedInUser");
      navigate("/");
    }
  };

  const filteredGroups = cases.filter((group) => {
    const combinedTerm = filterTerm.toLowerCase();
    return group.some((row) =>
      Object.values(row).some((v) =>
        String(v).toLowerCase().includes(combinedTerm),
      ),
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / pageSize));
  const currentGroups = filteredGroups.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const formatWithGaps = (text: string, term: string) => {
    if (!text) return "";
    const parts = text.split("◼");
    return parts.map((p, idx) => {
      if (p.trim() === "" && idx === 0) return null;
      let content = p.trim();
      if (term) {
        const regex = new RegExp(
          `(${term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`,
          "gi",
        );
        const highlighted = content.split(regex).map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-rose-100 text-rose-700 px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          ),
        );
        return (
          <div key={idx} className="bullet-item-wrapper">
            <span className="bullet-marker">◼</span>
            <span>{highlighted}</span>
          </div>
        );
      }
      return (
        <div key={idx} className="bullet-item-wrapper">
          <span className="bullet-marker">◼</span>
          <span>{content}</span>
        </div>
      );
    });
  };

  const handleSaveEditor = (updatedGroup: CaseGroup) => {
    const idx = cases.indexOf(editingGroup!);
    if (idx !== -1) {
      const updatedCases = [...cases];
      updatedCases[idx] = updatedGroup;
      setCases(updatedCases);
      localStorage.setItem(
        `cases_${currentYear}`,
        JSON.stringify(updatedCases),
      );
      showAlert("✅ Changes saved to Local Storage!");
    }
    setEditingGroup(null);
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[1000] no-print"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Menu Toggle */}
      <button
        className="fixed top-[15px] left-[15px] z-[999] bg-[#ffd6f0] border-2 border-[#ffb3c1] px-[15px] py-[10px] rounded-[8px] cursor-pointer font-bold text-[#d81b60] shadow-[0_4px_10px_rgba(0,0,0,0.1)] no-print flex items-center gap-2 md:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu size={20} /> Menu
      </button>

      {/* Sidebar */}
      <div
        className={`sidebar pastel-gradient-sidebar no-print ${isSidebarOpen ? "active" : ""} ${isSidebarCollapsed ? "collapsed" : ""}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-10 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                <Database size={20} />
              </div>
              <h2
                className={`text-xl font-bold text-slate-800 tracking-tight ${isSidebarCollapsed ? "md:sr-only" : ""}`}
              >
                CaseAdmin
              </h2>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-slate-600 hover:text-slate-800"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-1">
            <button
              className={`sidebar-btn group ${activeSection === "home" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("home");
                setIsSidebarOpen(false);
              }}
            >
              <div className="sidebar-icon-box">
                <Home size={20} />
              </div>
              <span
                className={`text-sm ${isSidebarCollapsed ? "md:sr-only" : ""}`}
              >
                Home
              </span>
            </button>

            <button
              className={`sidebar-btn group ${activeSection === "cases" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("cases");
                setIsSidebarOpen(false);
              }}
            >
              <div className="sidebar-icon-box">
                <Folder size={20} />
              </div>
              <span
                className={`text-sm ${isSidebarCollapsed ? "md:sr-only" : ""}`}
              >
                Cases
              </span>
            </button>

            <button
              className={`sidebar-btn group ${activeSection === "tracking" ? "active" : ""}`}
              onClick={() => {
                setActiveSection("tracking");
                setIsSidebarOpen(false);
              }}
            >
              <div className="sidebar-icon-box">
                <BarChart3 size={20} />
              </div>
              <span
                className={`text-sm ${isSidebarCollapsed ? "md:sr-only" : ""}`}
              >
                Yearly Tracking
              </span>
            </button>

            <button
              className="sidebar-btn group"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <div className="sidebar-icon-box">
                <Settings size={20} />
              </div>
              <span
                className={`text-sm ${isSidebarCollapsed ? "md:sr-only" : ""}`}
              >
                Settings
              </span>
              <ChevronDown
                size={18}
                className={`ml-auto transition-transform ${isSettingsOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 pl-4 space-y-1 ${isSettingsOpen ? "max-h-[400px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}
            >
              <button
                className={`sidebar-btn group ${activeSection === "accounts" ? "active" : ""}`}
                onClick={() => {
                  setActiveSection("accounts");
                  setIsSidebarOpen(false);
                }}
              >
                <div className="sidebar-icon-box w-8 h-8">
                  <UserIcon size={16} />
                </div>
                <span
                  className={`text-xs ${isSidebarCollapsed ? "md:sr-only" : ""}`}
                >
                  Accounts
                </span>
              </button>
              <button
                className={`sidebar-btn group ${activeSection === "system" ? "active" : ""}`}
                onClick={() => {
                  setActiveSection("system");
                  setIsSidebarOpen(false);
                }}
              >
                <div className="sidebar-icon-box w-8 h-8">
                  <Database size={16} />
                </div>
                <span
                  className={`text-xs ${isSidebarCollapsed ? "md:sr-only" : ""}`}
                >
                  System Data
                </span>
              </button>
              <div className="px-4 py-2 flex items-center justify-between"></div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <button
              className="sidebar-btn group text-rose-500 hover:bg-rose-50"
              onClick={handleLogout}
            >
              <div className="sidebar-icon-box bg-rose-50 text-rose-500">
                <LogOut size={18} />
              </div>
              <span
                className={`text-sm ${isSidebarCollapsed ? "md:sr-only" : ""}`}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsSidebarCollapsed((v) => !v)}
        className="hidden md:inline-flex fixed top-8 z-[1002] w-10 h-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 transition-colors -translate-x-1/2"
        style={{ left: isSidebarCollapsed ? 88 : 280 }}
        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        type="button"
      >
        <ChevronLeft
          size={18}
          className={
            isSidebarCollapsed
              ? "rotate-180 transition-transform"
              : "transition-transform"
          }
        />
      </button>

      {/* Main Content */}
      <div
        className={`main-content flex-1 p-4 md:p-8 pt-[80px] ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
      >
        {/* Home Section */}
        {activeSection === "home" && (
          <div className="animate-fade-in max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="pastel-peach-header p-10 rounded-[32px] mb-10 relative overflow-hidden shadow-sm group">
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <Daisy className="f1" delay={-1.2} />
                <Daisy className="f2" delay={-4.5} />
                <Daisy className="f3 opacity-10" delay={-2.8} />
                <Daisy className="f4 opacity-10" delay={-6.1} />
                <Daisy className="f5 opacity-5" delay={-3.4} />
                <div className="relative z-10">
                  <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
                    Welcome back, {loggedInUser?.username} 👋
                  </h2>
                  <p className="text-slate-800 text-lg max-w-xl leading-relaxed">
                    Your central hub for case management and system
                    administration. Everything you need is just a click away.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div
                  className="group cursor-pointer bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-rose-100 transition-all duration-300 relative overflow-hidden"
                  onClick={() => setActiveSection("cases")}
                >
                  <Daisy
                    className="f1 opacity-20 group-hover:opacity-40 transition-opacity"
                    delay={-0.5}
                  />
                  <Daisy
                    className="f2 opacity-10 group-hover:opacity-30 transition-opacity"
                    delay={-3.2}
                  />
                  <Daisy
                    className="f3 opacity-5 group-hover:opacity-20 transition-opacity"
                    delay={-1.8}
                  />
                  <Daisy
                    className="f4 opacity-10 group-hover:opacity-25 transition-opacity"
                    delay={-5.4}
                  />
                  <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Folder size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    Case Management
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    Upload, organize, and edit your case records with our
                    intuitive tools.
                  </p>
                </div>

                <div
                  className="group cursor-pointer bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-amber-100 transition-all duration-300 relative overflow-hidden"
                  onClick={() => setActiveSection("tracking")}
                >
                  <Daisy
                    className="f1 opacity-20 group-hover:opacity-40 transition-opacity"
                    delay={-1.5}
                  />
                  <Daisy
                    className="f3 opacity-5 group-hover:opacity-20 transition-opacity"
                    delay={-4.2}
                  />
                  <Daisy
                    className="f4 opacity-10 group-hover:opacity-25 transition-opacity"
                    delay={-2.7}
                  />
                  <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BarChart3 size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">
                    Yearly Tracking
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    Filter and track case trends across years and months with
                    deep insights.
                  </p>
                </div>

                <div
                  className="group cursor-pointer bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 relative overflow-hidden"
                  onClick={() => setActiveSection("system")}
                >
                  <Daisy
                    className="f1 opacity-20 group-hover:opacity-40 transition-opacity"
                    delay={-2.1}
                  />
                  <Daisy
                    className="f2 opacity-10 group-hover:opacity-30 transition-opacity"
                    delay={-6.8}
                  />
                  <Daisy
                    className="f4 opacity-10 group-hover:opacity-25 transition-opacity"
                    delay={-1.3}
                  />
                  <Daisy
                    className="f5 opacity-5 group-hover:opacity-15 transition-opacity"
                    delay={-4.2}
                  />
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Database size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">
                    System Backup
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    Keep your data safe with automated backups and easy
                    restoration.
                  </p>
                </div>

                <div
                  className="group cursor-pointer bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 relative overflow-hidden"
                  onClick={() => setActiveSection("accounts")}
                >
                  <Daisy
                    className="f1 opacity-20 group-hover:opacity-40 transition-opacity"
                    delay={-4.7}
                  />
                  <Daisy
                    className="f3 opacity-5 group-hover:opacity-20 transition-opacity"
                    delay={-0.9}
                  />
                  <Daisy
                    className="f4 opacity-10 group-hover:opacity-25 transition-opacity"
                    delay={-3.6}
                  />
                  <Daisy
                    className="f5 opacity-5 group-hover:opacity-15 transition-opacity"
                    delay={-7.2}
                  />
                  <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <UserIcon size={28} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">
                    Account Control
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    Manage security settings, passwords, and user access levels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cases Section */}
        {activeSection === "cases" && (
          <div className="animate-fade-in">
            <div className="flex justify-center mb-8 no-print">
              <h2 className="cases-title">Cases</h2>
            </div>

            {currentYear && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 no-print">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                    <Folder size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block">
                      Total Blocks
                    </span>
                    <span className="text-xl font-black text-slate-800">
                      {cases.length}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block">
                      Resolved
                    </span>
                    <span className="text-xl font-black text-emerald-600">
                      {
                        cases.flat().filter((r) => r.status === "RESOLVED")
                          .length
                      }
                    </span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block">
                      Pending
                    </span>
                    <span className="text-xl font-black text-amber-600">
                      {
                        cases.flat().filter((r) => r.status === "PENDING")
                          .length
                      }
                    </span>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block">
                      Dismissed
                    </span>
                    <span className="text-xl font-black text-rose-600">
                      {
                        cases.flat().filter((r) => r.status === "DISMISSED")
                          .length
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-white/20 mb-10 no-print">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">
                      Select Year
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddYear}
                        className="bg-emerald-50 text-emerald-600 rounded-xl px-4 py-2 border border-emerald-100 cursor-pointer font-bold text-xs hover:bg-emerald-100 transition-colors flex items-center gap-2"
                      >
                        <Upload size={14} /> Add Year
                      </button>
                      <button
                        onClick={handleRemoveYear}
                        className="bg-rose-50 text-rose-600 rounded-xl px-4 py-2 border border-rose-100 cursor-pointer font-bold text-xs hover:bg-rose-100 transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Remove Year
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {years
                      .sort((a, b) => parseInt(a) - parseInt(b))
                      .map((y) => (
                        <button
                          key={y}
                          onClick={() => loadCases(y)}
                          className={`px-8 py-3 rounded-2xl font-bold transition-all duration-300 shadow-sm ${currentYear === y ? "bg-rose-500 text-white shadow-rose-200 scale-105" : "bg-white text-slate-700 border border-slate-100 hover:border-rose-200 hover:text-rose-500"}`}
                        >
                          {y}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-4 flex-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 min-w-[140px] bg-white text-slate-700 p-5 rounded-2xl font-bold border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex items-center justify-center gap-3 group"
                    >
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload size={20} />
                      </div>
                      Upload Case Data
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv,.tsv"
                      onChange={handleFileUpload}
                    />
                    <button
                      onClick={handleRemoveAllCases}
                      className="flex-1 min-w-[140px] bg-white text-slate-700 p-5 rounded-2xl font-bold border border-slate-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all flex items-center justify-center gap-3 group"
                    >
                      <div className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Trash2 size={20} />
                      </div>
                      Clear All Records
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => window.print()}
                      className="w-14 h-14 bg-white text-slate-700 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:text-blue-500 transition-all flex items-center justify-center"
                      title="Print Cases"
                    >
                      <Printer size={24} />
                    </button>
                    <button
                      onClick={() => {
                        const csvContent =
                          "data:text/csv;charset=utf-8," +
                          [
                            "Case No.,Program,Name,Address,Filed,Complainant,Nature,Remarks,Status",
                          ]
                            .concat(
                              cases
                                .flat()
                                .map((r) =>
                                  [
                                    r.caseNo,
                                    r.program,
                                    r.name,
                                    r.address,
                                    r.filedCases,
                                    r.complainant,
                                    r.nature,
                                    r.remarks,
                                    r.status,
                                  ]
                                    .map((v) => `"${v.replace(/"/g, '""')}"`)
                                    .join(","),
                                ),
                            )
                            .join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute(
                          "download",
                          `cases_${currentYear || "export"}.csv`,
                        );
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="w-14 h-14 bg-white text-slate-700 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:text-emerald-500 transition-all flex items-center justify-center"
                      title="Export to CSV"
                    >
                      <FileSpreadsheet size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {currentYear && (
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {/* Action Bar */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 no-print">
                  <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div className="relative flex-1 w-full">
                      <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none z-10"
                        size={20}
                      />
                      <input
                        type="text"
                        placeholder="Search names, case numbers, or details..."
                        className="input-field pl-12"
                        value={filterTerm}
                        onChange={(e) => {
                          setFilterTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                        <button
                          disabled={currentPage === 1}
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          className="p-2.5 disabled:opacity-20 hover:bg-slate-50 rounded-xl transition-colors text-slate-700"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <div className="px-4 text-sm font-bold text-slate-700 min-w-[100px] text-center">
                          {currentPage}{" "}
                          <span className="text-slate-400 font-medium mx-1">
                            /
                          </span>{" "}
                          {totalPages}
                        </div>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          className="p-2.5 disabled:opacity-20 hover:bg-slate-50 rounded-xl transition-colors text-slate-700"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                      >
                        <FileText size={18} className="text-rose-500" /> Export
                        PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto print-table">
                  <table
                    className="w-full border-collapse min-w-[1200px]"
                    id="caseTable"
                  >
                    <thead>
                      <tr className="table-header">
                        <th className="p-4 text-center w-[5%]">Case No.</th>
                        <th className="p-4 text-center w-[7%]">Program</th>
                        <th className="p-4 text-left w-[12%]">Name</th>
                        <th className="p-4 text-left w-[12%]">Address</th>
                        <th className="p-4 text-center w-[5%]">Filed</th>
                        <th className="p-4 text-left w-[18%]">Complainant</th>
                        <th className="p-4 text-left w-[14%]">Nature</th>
                        <th className="p-4 text-left w-[15%]">Remarks</th>
                        <th className="p-4 text-center w-[8%]">Status</th>
                        <th className="p-4 text-center w-[4%] no-print">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentGroups.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-0">
                            <div className="flex flex-col items-center justify-center h-[500px] text-center p-10 bg-slate-50/20">
                              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm flex items-center justify-center text-4xl mb-6">
                                {filterTerm ? "🔍" : "🌱"}
                              </div>
                              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                                {filterTerm
                                  ? `No matches for "${filterTerm}"`
                                  : `No records found for ${currentYear}`}
                              </h3>
                              <p className="text-slate-700 max-w-md mx-auto leading-relaxed">
                                {filterTerm
                                  ? "Try checking your spelling or use a broader keyword to find what you are looking for."
                                  : "This year is currently empty. Start by uploading a case data file or adding a new record."}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentGroups.map((group, gIdx) => (
                          <React.Fragment key={gIdx}>
                            {group.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className={`group hover:bg-slate-50/50 transition-colors ${rIdx === 0 ? "border-t-2 border-slate-200" : ""}`}
                              >
                                {rIdx === 0 && (
                                  <>
                                    <td
                                      rowSpan={group.length}
                                      className="table-cell font-mono font-medium text-slate-900 text-center bg-slate-50/30"
                                    >
                                      {highlightText(row.caseNo, filterTerm)}
                                    </td>
                                    <td
                                      rowSpan={group.length}
                                      className="table-cell text-center font-semibold text-rose-500"
                                    >
                                      {highlightText(row.program, filterTerm)}
                                    </td>
                                    <td
                                      rowSpan={group.length}
                                      className="table-cell font-bold text-slate-800"
                                    >
                                      {highlightText(row.name, filterTerm)}
                                    </td>
                                    <td
                                      rowSpan={group.length}
                                      className="table-cell text-slate-700 italic"
                                    >
                                      {highlightText(row.address, filterTerm)}
                                    </td>
                                    <td
                                      rowSpan={group.length}
                                      className="table-cell text-center font-medium"
                                    >
                                      {highlightText(
                                        row.filedCases,
                                        filterTerm,
                                      )}
                                    </td>
                                  </>
                                )}
                                <td className="table-cell">
                                  {formatWithGaps(row.complainant, filterTerm)}
                                </td>
                                <td className="table-cell">
                                  {formatWithGaps(row.nature, filterTerm)}
                                </td>
                                {rIdx === 0 && (
                                  <>
                                    <td
                                      rowSpan={group.length}
                                      className="table-cell"
                                    >
                                      {formatWithGaps(row.remarks, filterTerm)}
                                    </td>
                                    <td
                                      rowSpan={group.length}
                                      className="table-cell text-center"
                                    >
                                      <span
                                        className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                          row.status
                                            .toLowerCase()
                                            .includes("pending")
                                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                                            : row.status
                                                  .toLowerCase()
                                                  .includes("resolved")
                                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                              : "bg-slate-50 text-slate-700 border border-slate-100"
                                        }`}
                                      >
                                        {row.status}
                                      </span>
                                    </td>
                                    <td
                                      rowSpan={group.length}
                                      className="table-cell text-center no-print"
                                    >
                                      <div className="flex flex-col gap-2 items-center">
                                        <button
                                          onClick={() => setEditingGroup(group)}
                                          className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 hover:border-rose-200 hover:text-rose-600 transition-all shadow-sm"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={async () => {
                                            if (
                                              await showConfirm(
                                                "Delete this entire case block?",
                                              )
                                            ) {
                                              const updatedCases = cases.filter(
                                                (g) => g !== group,
                                              );
                                              setCases(updatedCases);
                                              localStorage.setItem(
                                                `cases_${currentYear}`,
                                                JSON.stringify(updatedCases),
                                              );
                                            }
                                          }}
                                          className="w-full px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* System Section */}
        {activeSection === "system" && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="cases-title inline-block">System Data</h2>
              <p className="text-slate-700 mt-4 text-lg">
                Maintain complete backups of your local data or restore from a
                previous session.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center group hover:shadow-2xl transition-all duration-300">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Download size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  Backup Data
                </h3>
                <p className="text-slate-700 mb-8 leading-relaxed">
                  Download a secure JSON file containing all years and case
                  records currently stored.
                </p>
                <button
                  onClick={handleBackup}
                  className="primary-btn bg-emerald-600 shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
                >
                  Download Backup
                </button>
              </div>

              <div className="bg-white p-10 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center group hover:shadow-2xl transition-all duration-300">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  Restore Data
                </h3>
                <p className="text-slate-700 mb-8 leading-relaxed">
                  Upload a previous backup file to restore your system to a
                  specific state.
                </p>
                <button
                  onClick={() => restoreInputRef.current?.click()}
                  className="primary-btn bg-rose-600 shadow-lg shadow-rose-200 hover:shadow-rose-300"
                >
                  Restore Backup
                </button>
                <input
                  type="file"
                  ref={restoreInputRef}
                  className="hidden"
                  accept=".json"
                  onChange={handleRestore}
                />
              </div>
            </div>
          </div>
        )}

        {/* Yearly Tracking Section */}
        {activeSection === "tracking" && (
          <div className="animate-fade-in max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="cases-title inline-block">Yearly Tracking</h2>
              <p className="text-slate-700 mt-4 text-lg">
                Analyze case trends and filter records by year and month.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Select Year
                    </label>
                    <select
                      value={trackingYear}
                      onChange={(e) => {
                        setTrackingYear(e.target.value);
                        setTrackingMonth(""); // Reset month when year changes
                      }}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold outline-none focus:ring-4 focus:ring-amber-500/5 transition-all"
                    >
                      <option value="">-- Select Year --</option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Select Month
                    </label>
                    <select
                      value={trackingMonth}
                      onChange={(e) => setTrackingMonth(e.target.value)}
                      disabled={!trackingYear}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold outline-none focus:ring-4 focus:ring-amber-500/5 transition-all disabled:opacity-50"
                    >
                      <option value="">-- All Months --</option>
                      {[
                        "JANUARY",
                        "FEBRUARY",
                        "MARCH",
                        "APRIL",
                        "MAY",
                        "JUNE",
                        "JULY",
                        "AUGUST",
                        "SEPTEMBER",
                        "OCTOBER",
                        "NOVEMBER",
                        "DECEMBER",
                      ].map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {trackingYear && (
                  <div className="bg-amber-50 p-8 rounded-[32px] border border-amber-100 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-white text-amber-500 rounded-3xl flex items-center justify-center shadow-sm shrink-0">
                      <TrendingUp size={40} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="text-amber-900 font-black text-2xl tracking-tight">
                        {trackingMonth
                          ? `${trackingMonth} ${trackingYear}`
                          : `Full Year ${trackingYear}`}
                      </h4>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                        {(() => {
                          const yearData = JSON.parse(
                            localStorage.getItem(`cases_${trackingYear}`) ||
                              "[]",
                          );
                          const filtered = yearData.filter(
                            (group: CaseGroup) => {
                              if (!trackingMonth) return true;
                              return group.some((row: CaseRow) =>
                                Object.values(row).some((v) =>
                                  String(v)
                                    .toUpperCase()
                                    .includes(trackingMonth),
                                ),
                              );
                            },
                          );

                          const allRows = filtered.flat();
                          const statusCounts = {
                            RESOLVED: allRows.filter(
                              (r) => r.status === "RESOLVED",
                            ).length,
                            PENDING: allRows.filter(
                              (r) => r.status === "PENDING",
                            ).length,
                            DISMISSED: allRows.filter(
                              (r) => r.status === "DISMISSED",
                            ).length,
                          };

                          return (
                            <>
                              <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-amber-200/50">
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                                  Total Blocks
                                </span>
                                <span className="text-xl font-black text-amber-900">
                                  {filtered.length}
                                </span>
                              </div>
                              <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-200/50">
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">
                                  Resolved
                                </span>
                                <span className="text-xl font-black text-emerald-700">
                                  {statusCounts.RESOLVED}
                                </span>
                              </div>
                              <div className="bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-200/50">
                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">
                                  Pending
                                </span>
                                <span className="text-xl font-black text-amber-700">
                                  {statusCounts.PENDING}
                                </span>
                              </div>
                              <div className="bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-200/50">
                                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block">
                                  Dismissed
                                </span>
                                <span className="text-xl font-black text-rose-700">
                                  {statusCounts.DISMISSED}
                                </span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <PieIcon size={16} /> Status Distribution
                </h3>
                <div className="flex-1 min-h-[240px]">
                  {trackingYear ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={(() => {
                            const yearData = JSON.parse(
                              localStorage.getItem(`cases_${trackingYear}`) ||
                                "[]",
                            );
                            const filtered = yearData.filter(
                              (group: CaseGroup) => {
                                if (!trackingMonth) return true;
                                return group.some((row: CaseRow) =>
                                  Object.values(row).some((v) =>
                                    String(v)
                                      .toUpperCase()
                                      .includes(trackingMonth),
                                  ),
                                );
                              },
                            );
                            const allRows = filtered.flat();
                            return [
                              {
                                name: "Resolved",
                                value: allRows.filter(
                                  (r) => r.status === "RESOLVED",
                                ).length,
                                fill: "#10b981",
                              },
                              {
                                name: "Pending",
                                value: allRows.filter(
                                  (r) => r.status === "PENDING",
                                ).length,
                                fill: "#f59e0b",
                              },
                              {
                                name: "Dismissed",
                                value: allRows.filter(
                                  (r) => r.status === "DISMISSED",
                                ).length,
                                fill: "#f43f5e",
                              },
                            ].filter((d) => d.value > 0);
                          })()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {/* @ts-ignore */}
                          {(entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          )}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            backgroundColor: "#ffffff",
                            color: "#1e293b",
                          }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 italic text-sm">
                      Select a year to view chart
                    </div>
                  )}
                </div>
              </div>
            </div>

            {trackingYear ? (
              <div className="space-y-6">
                {(() => {
                  const yearData = JSON.parse(
                    localStorage.getItem(`cases_${trackingYear}`) || "[]",
                  );
                  const filtered = yearData.filter((group: CaseGroup) => {
                    if (!trackingMonth) return true;
                    return group.some((row: CaseRow) =>
                      Object.values(row).some((v) =>
                        String(v).toUpperCase().includes(trackingMonth),
                      ),
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="bg-white p-20 rounded-[40px] text-center border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Search size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-600">
                          No records found for this period
                        </h3>
                        <p className="text-slate-600 mt-2">
                          Try selecting a different month or check your data.
                        </p>
                      </div>
                    );
                  }

                  return filtered.map((group: CaseGroup, gIdx: number) => (
                    <div
                      key={gIdx}
                      className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                    >
                      <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-rose-500 font-bold">
                            {gIdx + 1}
                          </div>
                          <span className="font-bold text-slate-700">
                            Case Block #{gIdx + 1}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {Array.from(new Set(group.map((r) => r.status))).map(
                            (status) => (
                              <span
                                key={status}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  status === "DISMISSED"
                                    ? "bg-rose-100 text-rose-600"
                                    : status === "PENDING"
                                      ? "bg-amber-100 text-amber-600"
                                      : "bg-emerald-100 text-emerald-600"
                                }`}
                              >
                                {status}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-50/30">
                              <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Case No.
                              </th>
                              <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Name
                              </th>
                              <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Nature
                              </th>
                              <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.map((row: CaseRow, rIdx: number) => (
                              <tr
                                key={rIdx}
                                className="bg-white hover:bg-slate-50/50 transition-colors"
                              >
                                <td className="p-4 align-top">
                                  <div className="font-mono font-medium text-slate-900">
                                    {row.caseNo}
                                  </div>
                                </td>
                                <td className="p-4 align-top">
                                  <div className="font-bold text-slate-800">
                                    {row.name}
                                  </div>
                                </td>
                                <td className="p-4 align-top">
                                  <div className="text-slate-600">
                                    {row.nature}
                                  </div>
                                </td>
                                <td className="p-4 align-top">
                                  <span
                                    className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      row.status
                                        .toLowerCase()
                                        .includes("pending")
                                        ? "bg-rose-50 text-rose-600 border border-rose-100"
                                        : row.status
                                              .toLowerCase()
                                              .includes("resolved")
                                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                          : "bg-slate-50 text-slate-600 border border-slate-100"
                                    }`}
                                  >
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <div className="bg-white p-16 rounded-[40px] text-center border border-dashed border-slate-200">
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  Select a year to begin
                </h3>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">
                  Select a year from the dropdown above to start analyzing your
                  case data and tracking monthly trends.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Accounts Section */}
        {activeSection === "accounts" && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="cases-title inline-block">Account Control</h2>
              <p className="text-slate-500 mt-4 text-lg">
                Manage your administrative credentials and security preferences.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6 group hover:border-blue-100 transition-all">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <UserIcon size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800">
                    Switch Account
                  </h3>
                  <p className="text-slate-500">
                    Sign out and log in with a different administrative user.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/")}
                  className="px-8 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                >
                  Switch
                </button>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6 group hover:border-amber-100 transition-all">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Settings size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800">
                    Change Password
                  </h3>
                  <p className="text-slate-500">
                    Update your current login password for enhanced security.
                  </p>
                </div>
                <button
                  onClick={handleChangePassword}
                  className="px-8 py-3 bg-amber-50 text-amber-600 rounded-xl font-bold hover:bg-amber-100 transition-colors"
                >
                  Change
                </button>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6 group hover:border-rose-100 transition-all">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Trash2 size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800">
                    Delete Account
                  </h3>
                  <p className="text-slate-500">
                    Permanently remove your administrative account from the
                    system.
                  </p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="px-8 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 w-14 h-14 bg-rose-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[4000] no-print"
      >
        <ChevronDown className="rotate-180" size={24} />
      </button>

      {/* Modals */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[5000] flex items-center justify-center p-4">
          <div className="glass-card p-10 max-w-md w-full animate-fade-in rounded-[32px]">
            <div className="text-center mb-8">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-sm ${
                  modalType === "confirm"
                    ? "bg-amber-50 text-amber-500"
                    : modalType === "prompt"
                      ? "bg-blue-50 text-blue-500"
                      : "bg-rose-50 text-rose-500"
                }`}
              >
                {modalType === "confirm" ? (
                  <Settings size={32} />
                ) : modalType === "prompt" ? (
                  <UserIcon size={32} />
                ) : (
                  <Database size={32} />
                )}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 whitespace-pre-line leading-tight">
                {modalMessage}
              </h3>
            </div>

            {modalType === "prompt" && (
              <div className="mb-8">
                <input
                  type={
                    modalMessage.toLowerCase().includes("password")
                      ? "password"
                      : "text"
                  }
                  className="input-field"
                  placeholder="Type here..."
                  value={promptValue}
                  onChange={(e) => setPromptValue(e.target.value)}
                  autoFocus
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleModalClose(promptValue)
                  }
                />
              </div>
            )}

            <div className="flex gap-4">
              {modalType === "confirm" ? (
                <>
                  <button
                    onClick={() => handleModalClose(true)}
                    className="flex-1 p-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleModalClose(false)}
                    className="flex-1 p-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : modalType === "prompt" ? (
                <>
                  <button
                    onClick={() => handleModalClose(promptValue)}
                    className="flex-1 p-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => handleModalClose(null)}
                    className="flex-1 p-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleModalClose(null)}
                  className="w-full p-4 bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-900 transition-all"
                >
                  Understood
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Block Editor Modal */}
      {editingGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[5000] flex items-center justify-center p-4 md:p-10">
          <div className="bg-white w-full h-full flex flex-col rounded-[40px] overflow-hidden shadow-2xl border border-white/20 animate-fade-in">
            <div className="p-8 bg-slate-50/80 backdrop-blur-sm flex flex-col md:flex-row justify-between items-center border-b border-slate-200 gap-6">
              <div>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
                  Spreadsheet Editor
                </h3>
                <p className="text-slate-500 mt-1">
                  Directly edit case block details in a grid view.
                </p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button
                  onClick={() => {
                    const rows = Array.from(
                      document.querySelectorAll("#editorTable tbody tr"),
                    );
                    const updated = rows.map((tr) => {
                      const obj: any = {};
                      tr.querySelectorAll("textarea").forEach(
                        (ta: any) => (obj[ta.dataset.field] = ta.value),
                      );
                      tr.querySelectorAll("select").forEach(
                        (sel: any) => (obj[sel.dataset.field] = sel.value),
                      );
                      const allowed = ["DISMISSED", "PENDING", "RESOLVED"];
                      const raw = String(obj.status ?? "").toUpperCase();
                      const match = raw.match(/DISMISSED|PENDING|RESOLVED/);
                      obj.status =
                        match && allowed.includes(match[0])
                          ? match[0]
                          : "PENDING";
                      return obj as CaseRow;
                    });
                    handleSaveEditor(updated);
                  }}
                  className="flex-1 md:flex-none px-10 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingGroup(null)}
                  className="flex-1 md:flex-none px-10 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-slate-50/30">
              <table className="w-full border-collapse" id="editorTable">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr>
                    {[
                      "Case No.",
                      "Program",
                      "Name",
                      "Address",
                      "Filed",
                      "Complainant",
                      "Nature",
                      "Remarks",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="p-5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {editingGroup.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="bg-white hover:bg-slate-50/50 transition-colors"
                    >
                      {[
                        "caseNo",
                        "program",
                        "name",
                        "address",
                        "filedCases",
                        "complainant",
                        "nature",
                        "remarks",
                        "status",
                      ].map((f) => (
                        <td key={f} className="p-4 align-top">
                          {f === "status" ? (
                            <select
                              defaultValue={
                                String(row[f as keyof CaseRow] ?? "")
                                  .toUpperCase()
                                  .match(/DISMISSED|PENDING|RESOLVED/)?.[0] ??
                                "PENDING"
                              }
                              data-field={f}
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                            >
                              <option value="DISMISSED">DISMISSED</option>
                              <option value="PENDING">PENDING</option>
                              <option value="RESOLVED">RESOLVED</option>
                            </select>
                          ) : (
                            <textarea
                              defaultValue={row[f as keyof CaseRow]
                                .split("◼")
                                .filter((p) => p.trim() !== "")
                                .map((p) => "◼ " + p.trim())
                                .join("\n")}
                              data-field={f}
                              className="w-full min-h-[140px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-600 font-sans resize-y outline-none focus:bg-white focus:ring-4 focus:ring-rose-500/5 transition-all whitespace-pre-wrap leading-relaxed"
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style>{`
        #caseTable th {
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .empty-state-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
      `}</style>
    </div>
  );
};
