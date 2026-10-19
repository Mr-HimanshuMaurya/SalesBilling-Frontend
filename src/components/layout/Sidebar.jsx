import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  X,
  UserRoundCheck,
  CloudSync,
  AlertTriangle,
  ServerIcon,
  UserCheck,
  AlertCircle,
  Server,
  ScrollText,
  ChevronDown,
  UserX,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  const sidebarNavRef = useRef(null);

  const saveSidebarScroll = () => {
    if (!sidebarNavRef.current) return;

    const key = `${user?.role ?? "guest"}-sidebar-scroll`;
    sessionStorage.setItem(key, String(sidebarNavRef.current.scrollTop));
  };

  useEffect(() => {
    if (!sidebarNavRef.current) return;

    const key = `${user?.role ?? "guest"}-sidebar-scroll`;
    const savedScroll = Number(sessionStorage.getItem(key) ?? 0);

    if (Number.isFinite(savedScroll)) {
      sidebarNavRef.current.scrollTop = savedScroll;
    }
  }, [user?.role]);

  useEffect(() => {
    const nav = sidebarNavRef.current;
    if (!nav) return;

    const handleScroll = () => {
      const key = `${user?.role ?? "guest"}-sidebar-scroll`;
      sessionStorage.setItem(key, String(nav.scrollTop));
    };

    nav.addEventListener("scroll", handleScroll);

    return () => nav.removeEventListener("scroll", handleScroll);
  }, [user?.role]);

  const [openMenus, setOpenMenus] = useState({
  leads: true,
  "new-lead": false,
  connected: false,
  "interested-follow-up": false,
  "not-interested": false,
  "not-connected": false,
});

const toggleMenu = (menu) => {
  setOpenMenus((prev) => {
    const next = { ...prev };

    // Top-level children inside Leads
    const leadsChildren = [
      "new-lead",
      "connected",
      "not-connected",
    ];

    // Children inside Connected
    const connectedChildren = [
      "interested-follow-up",
      "not-interested",
    ];

    // Close sibling menus
    if (leadsChildren.includes(menu)) {
      leadsChildren.forEach((key) => {
        next[key] = false;
      });
    }

    if (connectedChildren.includes(menu)) {
      connectedChildren.forEach((key) => {
        next[key] = false;
      });
    }

    // Toggle the selected menu
    next[menu] = !prev[menu];

    return next;
  });
};

  const getNavItems = () => {
    if (user?.role === "superadmin") {
      return [
        {
          to: "/admin/dashboard",
          icon: LayoutDashboard,
          label: "Dashboard",
        },
        {
          to: "/admin/users",
          icon: Users,
          label: "Team Members",
        },
        {
          to: "/admin/clients",
          icon: UserRoundCheck,
          label: "All Clients",
        },
        {
          to: "/admin/clients-without-bills",
          icon: AlertTriangle,
          label: "Clients Without Bills",
        },
        {
          to: "/admin/bills",
          icon: FileText,
          label: "All Bills",
        },
        {
          to: "/admin/proforma-invoice",
          icon: ScrollText,
          label: "Proforma Invoice",
        },
        {
          to: "/billing-renewal",
          icon: CloudSync,
          label: "Upcoming Renewal",
        },
        {
          to: "/lost-clients",
          icon: UserX,
          label: "Lost Clients",
        },
        // {
        //   to: "/admin/server-info",
        //   icon: Server,
        //   label: "Server Information",
        // },
        // {
        //   to: "/sales/leads",
        //   icon: Users,
        //   label: "Leads",
        // },
      ];
    }

    if (user?.role === "server_admin") {
      return [
        {
          to: "/server/dashboard",
          icon: LayoutDashboard,
          label: "Dashboard",
        },
        {
          to: "/admin/clients",
          icon: UserRoundCheck,
          label: "All Clients",
        },
        {
          to: "/server/servers",
          icon: ServerIcon,
          label: "Servers",
        },
        {
          to: "/server/assignments",
          icon: UserCheck,
          label: "Client Servers",
        },
        {
          to: "/server/expiring",
          icon: AlertCircle,
          label: "Expiring Soon",
        },
        {
          to: "/lost-clients",
          icon: UserX,
          label: "Lost Clients",
        },
      ];
    }

    if (user?.role === "sales") {
      return [
        // {
        //   type: "nested",
        //   key: "leads",
        //   icon: ScrollText,
        //   label: "Leads",

        //   children: [
        //     {
        //       to: "/sales/reminder",
        //       label: "Reminder",
        //     },
        //     {
        //       to: "/sales/leads",
        //       label: "All Leads",
        //     },
        //     {
        //       type: "nested",
        //       key: "new-lead",
        //       label: "New Lead",
        //       children: [
        //         {
        //           to: "/sales/leads/new/international",
        //           label: "International",
        //         },
        //         {
        //           to: "/sales/leads/new/domestic",
        //           label: "Domestic",
        //         },
        //       ],
        //     },
        //     {
        //       type: "nested",
        //       key: "connected",
        //       label: "Connected",
        //       children: [
        //         {
        //           type: "nested",
        //           key: "interested-follow-up",
        //           label: "Interested Follow Up",
        //           children: [
        //             {
        //               to: "/sales/leads/connected/interested-follow-up/hot-lead",
        //               label: "Hot Lead",
        //             },
        //             {
        //               to: "/sales/leads/connected/interested-follow-up/cold-lead",
        //               label: "Cold Lead",
        //             },
        //             {
        //               to: "/sales/leads/connected/interested-follow-up/detail-share",
        //               label: "Detail Share",
        //             },
        //             {
        //               to: "/sales/leads/connected/interested-follow-up/call-back",
        //               label: "Call Back",
        //             },
        //           ],
        //         },
        //         {
        //           type: "nested",
        //           key: "not-interested",
        //           label: "Not Interested Follow Up",
        //           children: [
        //             {
        //               to: "/sales/leads/connected/not-interested/customer-no-tally",
        //               label: "Customer Doesn't Have Tally",
        //             },
        //             {
        //               to: "/sales/leads/connected/not-interested/not-relevant",
        //               label: "Not Relevant",
        //             },
        //             {
        //               to: "/sales/leads/connected/not-interested/another-company",
        //               label: "Customer With Another Company",
        //             },
        //           ],
        //         },
        //       ],
        //     },
        //     {
        //       type: "nested",
        //       key: "not-connected",
        //       label: "Not Connected",
        //       children: [
        //         {
        //           to: "/sales/leads/not-connected/not-answered",
        //           label: "Not Answered",
        //         },
        //         {
        //           to: "/sales/leads/not-connected/offline",
        //           label: "Offline",
        //         },
        //         {
        //           to: "/sales/leads/not-connected/invalid",
        //           label: "Invalid",
        //         },
        //         {
        //           to: "/sales/leads/not-connected/other",
        //           label: "Other",
        //         },
        //       ],
        //     },
        //   ],
        // },

        {
          to: "/sales/clients",
          icon: Users,
          label: "Clients",
        },

        {
          to: "/sales/billing",
          icon: FileText,
          label: "Billing",
        },

        {
          to: "/sales/billing-renewal",
          icon: CloudSync,
          label: "Upcoming Renewal",
        },
        {
          to: "/lost-clients",
          icon: UserX,
          label: "Lost Clients",
        },
      ];
    }

    if (user?.role === "accountant") {
      return [
        {
          to: "/admin/clients",
          icon: UserRoundCheck,
          label: "All Clients",
        },
        {
          to: "/accountant/billing",
          icon: FileText,
          label: "Billing",
        },
        {
          to: "/billing-renewal",
          icon: CloudSync,
          label: "Upcoming Renewal",
        },
        {
          to: "/lost-clients",
          icon: UserX,
          label: "Lost Clients",
        },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  // Check whether a normal or nested menu contains the current route
  const hasActiveChild = (item) => {
    if (!item?.children) {
      return false;
    }

    return item.children.some((child) => {
      // Normal route child
      if (child.to) {
        return (
          location.pathname === child.to ||
          location.pathname.startsWith(`${child.to}/`)
        );
      }

      // Nested child
      if (
        child.type === "nested" ||
        child.type === "nested-nested"
      ) {
        return hasActiveChild(child);
      }

      return false;
    });
  };

  // Render normal route
  const renderNormalItem = (item, level = 0) => {
    const isActive =
      location.pathname === item.to ||
      location.pathname.startsWith(`${item.to}/`);

    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={() => {
          saveSidebarScroll();
          onClose?.();
        }}
        className={`
          flex items-center gap-3
          ${
            level === 0
              ? "px-4 py-3"
              : level === 1
              ? "px-3 py-2"
              : "px-3 py-2"
          }
          rounded-lg
          text-sm
          font-medium
          transition-colors duration-200
          ${
            isActive
              ? "bg-indigo-50 text-indigo-700 border-l-2 border-indigo-600"
              : "text-gray-600 hover:bg-gray-100"
          }
        `}
      >
        {item.icon && (
          <item.icon
            className={`
              shrink-0
              ${
                level === 0
                  ? "w-5 h-5"
                  : "w-4 h-4"
              }
            `}
          />
        )}

        <span className="truncate">{item.label}</span>
      </NavLink>
    );
  };

  // Render nested / nested-nested menu
  const renderNestedItem = (item, level = 0) => {
    const isOpenMenu = !!openMenus[item.key];
    const isParentActive = hasActiveChild(item);

    return (
      <div key={item.key} className="w-full">
        <button
          type="button"
          onClick={() => toggleMenu(item.key)}
          className={`
            w-full
            flex items-center justify-between
            ${
              level === 0
                ? "px-4 py-3"
                : "px-3 py-2"
            }
            rounded-lg
            text-sm
            font-medium
            transition-colors duration-200
            ${
              isParentActive
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100"
            }
          `}
        >
          <div className="flex items-center gap-3 min-w-0">
            {item.icon && (
              <item.icon
                className={`
                  shrink-0
                  ${
                    level === 0
                      ? "w-5 h-5"
                      : "w-4 h-4"
                  }
                `}
              />
            )}

            <span className="truncate">
              {item.label}
            </span>
          </div>

          <ChevronDown
            className={`
              w-4 h-4 shrink-0
              transition-transform duration-200
              ${
                isOpenMenu
                  ? "rotate-180"
                  : ""
              }
            `}
          />
        </button>

        {isOpenMenu && (
          <div
            className={`
              block
              w-full
              mt-2
              space-y-2
              border-l
              border-gray-200
              ml-0
              pl-3
            `}
          >
            {item.children?.map((child) => {
              // Child is another nested menu
              if (
                child.type === "nested" ||
                child.type === "nested-nested"
              ) {
                return renderNestedItem(
                  child,
                  level + 1
                );
              }

              // Child is a normal route
              return renderNormalItem(
                child,
                level + 1
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static
          top-0 left-0
          h-full
          w-60
          bg-white
          border-r border-gray-200
          flex flex-col
          z-40
          transform
          transition-transform
          duration-200
          ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header / Logo */}
        <div className="p-2 border-b border-gray-200 flex items-center justify-between">
          <div className="flex flex-col items-center">
            <img
              src="/aasthalogo.png"
              alt="Aastha Logo"
              className="h-15 w-auto"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden cursor-pointer text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Navigation */}
        <nav
          ref={sidebarNavRef}
          className="flex-1 p-4 space-y-1 overflow-y-auto"
        >
          {navItems.map((item) => {
            // Normal menu
            if (item.type !== "nested" && item.type !== "nested-nested") {
              return renderNormalItem(item, 0);
            }

            // Nested or nested-nested menu
            return renderNestedItem(item, 0);
          })}
        </nav>
      </div>
    </>
  );
};
