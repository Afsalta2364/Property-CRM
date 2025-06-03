import { useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader as UISidebarHeader,
  SidebarContent,
  // SidebarFooter, // Not used for now
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Bell, Users, Building, Calendar, BarChart3, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

// Tabs
import { ClientsTab } from "@/components/clients/clients-tab";
import { PropertiesTab } from "@/components/properties/properties-tab";
import { MeetingsTab } from "@/components/meetings/meetings-tab";
import { AnalyticsTab } from "@/components/analytics/analytics-tab";
import { PortfolioTab } from "@/components/portfolio/portfolio-tab";

type TabType = "clients" | "properties" | "meetings" | "analytics" | "portfolio";

const navigationItems = [
  { name: "Clients", tab: "clients" as TabType, icon: Users },
  { name: "Properties", tab: "properties" as TabType, icon: Building },
  { name: "Meeting Scheduler", tab: "meetings" as TabType, icon: Calendar },
  { name: "Analytics", tab: "analytics" as TabType, icon: BarChart3 },
  { name: "Portfolio", tab: "portfolio" as TabType, icon: Briefcase },
];

// Header component for the main content area
function MainHeaderContent() {
  return (
    <header className="bg-surface shadow-sm border-b border-border sticky top-0 z-10">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* SidebarTrigger for mobile, managed by SidebarProvider/Sidebar for desktop */}
            <SidebarTrigger className="mr-4 md:hidden" />
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <span className="text-sm font-medium text-foreground">John Doe</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("clients");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "clients":
        return <ClientsTab />;
      case "properties":
        return <PropertiesTab />;
      case "meetings":
        return <MeetingsTab />;
      case "analytics":
        return <AnalyticsTab />;
      case "portfolio":
        return <PortfolioTab />;
      default:
        return <ClientsTab />;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsible="icon" variant="sidebar" side="left">
          <UISidebarHeader className="p-4 flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-sidebar-primary group-data-[collapsible=icon]:hidden">
              PropertyCRM
            </h1>
            {/* This trigger is for desktop when sidebar is collapsed to icon */}
            <SidebarTrigger className="hidden group-data-[collapsible=icon]:block" />
          </UISidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.tab}>
                    <SidebarMenuButton
                      onClick={() => setActiveTab(item.tab)}
                      isActive={activeTab === item.tab}
                      tooltip={{ children: item.name, side: "right", align: "center" }}
                    >
                      <Icon />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          {/* 
          <SidebarFooter>
            Optional footer content e.g. settings, logout
          </SidebarFooter> 
          */}
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <MainHeaderContent />
          <div className="flex-1 overflow-y-auto"> {/* Content scrolling area */}
            {renderActiveTab()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
