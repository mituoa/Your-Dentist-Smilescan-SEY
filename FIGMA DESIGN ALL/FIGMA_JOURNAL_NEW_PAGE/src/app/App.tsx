import * as React from "react";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { ForgotPassword } from "./components/auth/ForgotPassword";
import { ResetPassword } from "./components/auth/ResetPassword";
import { AcceptInvite } from "./components/auth/AcceptInvite";
import { LoginThemeShowcase } from "./components/auth/LoginThemeVariants";
import { LoginStateReference } from "./components/auth/LoginStateReference";
import { RegisterStateReference } from "./components/auth/RegisterStateReference";
import { ForgotPasswordStateReference } from "./components/auth/ForgotPasswordStateReference";
import { ProtectedShell } from "./components/layout/ProtectedShell";
import { AppShell } from "./components/layout/AppShell";
import { JournalList } from "./components/journal/JournalList";
import { ArticleEditor } from "./components/journal/ArticleEditor";
import { getArticles, createArticle, deleteArticle } from "./components/journal/actions";
import {
  createDraftArticle,
  getArticle,
  saveArticle,
  publishArticle,
  unpublishArticle,
  uploadCover,
} from "./components/journal/editorActions";

type View = "login" | "register" | "forgot-password" | "reset-password" | "accept-invite" | "themes" | "states" | "register-states" | "forgot-states" | "journal" | "journal-new" | "journal-edit";

export default function App() {
  const [view, setView] = React.useState<View>("journal-edit");
  const [articles, setArticles] = React.useState<any[]>([]);
  const [articlesLoaded, setArticlesLoaded] = React.useState(false);
  const [currentArticle, setCurrentArticle] = React.useState<any>(null);
  const [isCreatingArticle, setIsCreatingArticle] = React.useState(false);

  // Example: Parse params from URL (in real app, use router)
  const urlParams = new URLSearchParams(window.location.search);
  const inviteToken = urlParams.get("invite");
  const prefilledEmail = urlParams.get("email");
  const errorMessage = urlParams.get("error");
  const successSent = urlParams.get("sent") === "1";
  const resetToken = urlParams.get("token");
  const viewParam = urlParams.get("view") as View | null;

  React.useEffect(() => {
    if (viewParam && ["login", "register", "forgot-password", "reset-password", "accept-invite", "themes", "states", "register-states", "forgot-states", "journal", "journal-new", "journal-edit"].includes(viewParam)) {
      setView(viewParam);
    }
  }, [viewParam]);

  React.useEffect(() => {
    if (view === "journal" && !articlesLoaded) {
      getArticles().then((data) => {
        setArticles(data);
        setArticlesLoaded(true);
      });
    }
  }, [view, articlesLoaded]);

  // Handle /journal/new - create draft and redirect
  React.useEffect(() => {
    if (view === "journal-new" && !isCreatingArticle) {
      setIsCreatingArticle(true);
      createDraftArticle().then((newId) => {
        // In real app, this would be handled by router
        window.history.pushState({}, "", `/journal/${newId}/edit`);

        // Load the new article
        getArticle(newId).then((article) => {
          setCurrentArticle(article);
          setView("journal-edit");
          setIsCreatingArticle(false);
        });
      });
    }
  }, [view, isCreatingArticle]);

  // Load article for edit view
  React.useEffect(() => {
    if (view === "journal-edit" && !currentArticle) {
      // Mock article ID - in real app, get from URL params
      const articleId = "article-1";
      getArticle(articleId).then((article) => {
        setCurrentArticle(article);
      });
    }
  }, [view, currentArticle]);

  const handleCreateArticle = async () => {
    const newId = await createArticle();
    const updatedArticles = await getArticles();
    setArticles(updatedArticles);
    return newId;
  };

  const handleDeleteArticle = async (id: string) => {
    await deleteArticle(id);
    const updatedArticles = await getArticles();
    setArticles(updatedArticles);
  };

  const handleSaveArticle = async (updates: any) => {
    if (!currentArticle) return;
    await saveArticle(currentArticle.id, updates);
    setCurrentArticle({ ...currentArticle, ...updates });
  };

  const handlePublishArticle = async () => {
    if (!currentArticle) return;
    await publishArticle(currentArticle.id);
    setCurrentArticle({ ...currentArticle, status: "published" });
  };

  const handleUnpublishArticle = async () => {
    if (!currentArticle) return;
    await unpublishArticle(currentArticle.id);
    setCurrentArticle({ ...currentArticle, status: "draft" });
  };

  const handleUploadCover = async (file: File): Promise<string> => {
    const url = await uploadCover(file);
    return url;
  };

  // Navigation buttons - using Premium (Slate-Blue) theme colors
  const NavBar = () => (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-200 px-4 py-2 flex gap-2 flex-wrap justify-center max-w-3xl">
      <button
        onClick={() => setView("login")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "login"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Login
      </button>
      <button
        onClick={() => setView("register")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "register"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Register
      </button>
      <button
        onClick={() => setView("forgot-password")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "forgot-password"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Forgot Password
      </button>
      <button
        onClick={() => setView("reset-password")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "reset-password"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Reset Password
      </button>
      <button
        onClick={() => setView("accept-invite")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "accept-invite"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Accept Invite
      </button>
      <button
        onClick={() => setView("themes")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "themes"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Themes
      </button>
      <button
        onClick={() => setView("states")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "states"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Login States
      </button>
      <button
        onClick={() => setView("register-states")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "register-states"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Register States
      </button>
      <button
        onClick={() => setView("forgot-states")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "forgot-states"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Forgot States
      </button>
      <button
        onClick={() => setView("journal")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "journal"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Journal
      </button>
      <button
        onClick={() => setView("journal-new")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "journal-new"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        New Article
      </button>
      <button
        onClick={() => setView("journal-edit")}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          view === "journal-edit"
            ? "bg-slate-700 text-white"
            : "bg-transparent text-gray-700 hover:bg-gray-100"
        }`}
      >
        Edit Article
      </button>
    </div>
  );

  return (
    <>
      {view !== "login" && view !== "register" && view !== "forgot-password" && view !== "reset-password" && view !== "accept-invite" && <NavBar />}
      {view === "login" && (
        <>
          <NavBar />
          <Login inviteToken={inviteToken} />
        </>
      )}
      {view === "register" && (
        <>
          <NavBar />
          <Register
            inviteToken={inviteToken}
            inviteWorkspaceName={inviteToken ? "Praxis Dr. Müller" : null}
            prefilledEmail={prefilledEmail}
            errorMessage={errorMessage}
          />
        </>
      )}
      {view === "forgot-password" && (
        <>
          <NavBar />
          <ForgotPassword
            inviteToken={inviteToken}
            prefilledEmail={prefilledEmail}
            errorMessage={errorMessage}
            successSent={successSent}
          />
        </>
      )}
      {view === "reset-password" && (
        <>
          <NavBar />
          <ResetPassword
            resetToken={resetToken}
            inviteToken={inviteToken}
          />
        </>
      )}
      {view === "accept-invite" && (
        <>
          <NavBar />
          <AcceptInvite inviteToken={inviteToken || "test-invite-token"} />
        </>
      )}
      {view === "themes" && <LoginThemeShowcase />}
      {view === "states" && <LoginStateReference />}
      {view === "register-states" && <RegisterStateReference />}
      {view === "forgot-states" && <ForgotPasswordStateReference />}
      {view === "journal" && (
        <>
          <NavBar />
          <ProtectedShell
            user={{
              name: "Dr. Maria Schmidt",
              email: "maria.schmidt@example.com",
              role: "doctor",
            }}
            workspace={{
              name: "Praxis Dr. Schmidt",
            }}
            currentPath="/journal"
          >
            <JournalList
              articles={articles}
              onCreateArticle={handleCreateArticle}
              onDeleteArticle={handleDeleteArticle}
            />
          </ProtectedShell>
        </>
      )}
      {view === "journal-new" && (
        <>
          <NavBar />
          <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 animate-pulse">
                <div className="w-8 h-8 border-4 border-slate-300 dark:border-slate-700 border-t-slate-700 dark:border-t-slate-300 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Artikel wird erstellt…
              </p>
            </div>
          </div>
        </>
      )}
      {view === "journal-edit" && currentArticle && (
        <>
          <NavBar />
          <AppShell
            user={{
              name: "Dr. Maria Schmidt",
              email: "maria.schmidt@example.com",
              role: "doctor",
            }}
            workspace={{
              name: "Praxis Dr. Schmidt",
            }}
            currentPath="/journal/edit"
          >
            <ArticleEditor
              article={currentArticle}
              onSave={handleSaveArticle}
              onPublish={handlePublishArticle}
              onUnpublish={handleUnpublishArticle}
              onUploadCover={handleUploadCover}
            />
          </AppShell>
        </>
      )}
    </>
  );
}