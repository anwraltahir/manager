import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectForm } from './components/projects/ProjectForm';
import { ProjectDetails } from './components/projects/ProjectDetails';
import { ClientsView } from './components/clients/ClientsView';
import { QuotationsView } from './components/quotations/QuotationsView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginScreen } from './components/auth/LoginScreen';

function MainApp() {
  const {
    isAuthenticated,
    currentView,
    setCurrentView,
    selectedProjectId,
    setSelectedProjectId,
    projects,
  } = useApp();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If user is locked out / not authenticated, show secure login
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentView('project_details');
  };

  const handleNewProject = () => {
    setSelectedProjectId(null);
    setCurrentView('new_project');
  };

  const handleEditProject = () => {
    setCurrentView('edit_project');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onSelectProject={handleSelectProject}
            onNewProject={handleNewProject}
            initialFilter="all"
          />
        );

      case 'projects':
        return (
          <DashboardView
            onSelectProject={handleSelectProject}
            onNewProject={handleNewProject}
            initialFilter="all"
          />
        );

      case 'in_progress':
        return (
          <DashboardView
            onSelectProject={handleSelectProject}
            onNewProject={handleNewProject}
            initialFilter="in_progress"
          />
        );

      case 'completed':
        return (
          <DashboardView
            onSelectProject={handleSelectProject}
            onNewProject={handleNewProject}
            initialFilter="completed"
          />
        );

      case 'quotations':
        return (
          <QuotationsView
            onSelectProject={handleSelectProject}
            onNewProject={handleNewProject}
          />
        );

      case 'clients':
        return <ClientsView onSelectProject={handleSelectProject} />;

      case 'settings':
        return <SettingsView />;

      case 'new_project':
        return (
          <ProjectForm
            onCancel={() => setCurrentView('dashboard')}
            onSave={(savedProject) => {
              setSelectedProjectId(savedProject.id);
              setCurrentView('project_details');
            }}
          />
        );

      case 'edit_project':
        return (
          <ProjectForm
            initialProject={selectedProject}
            onCancel={() => setCurrentView('project_details')}
            onSave={(savedProject) => {
              setSelectedProjectId(savedProject.id);
              setCurrentView('project_details');
            }}
          />
        );

      case 'project_details':
        if (!selectedProject) {
          return (
            <DashboardView
              onSelectProject={handleSelectProject}
              onNewProject={handleNewProject}
              initialFilter="all"
            />
          );
        }
        return (
          <ProjectDetails
            project={selectedProject}
            onEdit={handleEditProject}
            onBack={() => setCurrentView('dashboard')}
          />
        );

      default:
        return (
          <DashboardView
            onSelectProject={handleSelectProject}
            onNewProject={handleNewProject}
            initialFilter="all"
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-slate-800 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onNewProject={handleNewProject}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
          onNewProject={handleNewProject}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
