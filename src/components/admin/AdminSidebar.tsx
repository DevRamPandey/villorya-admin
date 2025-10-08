import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FileText,
  HelpCircle,
  Menu,
  Box,
  FlaskConical,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/admin",
  },
  {
    title: "Products",
    icon: Box,
    url: "/admin/products",
  },
  {
    title: "Package Suppliers",
    icon: Package,
    url: "/admin/package-suppliers",
  },
  {
    title: "Raw Material Suppliers",
    icon: ShoppingBag,
    url: "/admin/raw-suppliers",
  },
  {
    title: "CMS Content",
    icon: FileText,
    url: "/admin/cms",
  },
  {
    title: "Supplier Questions",
    icon: HelpCircle,
    url: "/admin/questions",
  },
  {
    title: "R&D",
    icon: FlaskConical,
    url: "/admin/rd",
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="bg-sidebar">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              Admin Panel
            </h2>
          )}
        </div>

        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-muted-foreground">
              Management
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
