import { Create, Login, Note, People, Receipt } from "@mui/icons-material";
import { List } from "@mui/material";
import {
  IconAperture,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUserPlus,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Home",
  },
 
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    navlabel: true,
    subheader: "Order",
  },
  {
    id: uniqueId(),
    title: "Create Order",
    icon: Create,
    href: "/utilities/create-order",
  },
  {
    id: uniqueId(),
    title: "List Orders",
    icon: Note,
    href: "/utilities/list-all-orders",

  },
  {
    navlabel: true,
    subheader: "Invoice",
  },
  {
    id: uniqueId(),
    title: "Create Invoice",
    icon: Receipt,
    href: "/utilities/create-invoice",
  },
  {
    id: uniqueId(),
    title: "List Invoices",
    icon: Note,
    href: "/utilities/list-all-invoices",
    
  },
  {
    navlabel: true,
    subheader: "Product Made Daily",
  },
  {
    id: uniqueId(),
    title: "Add Todays product",
    icon: Create,
    href: "/utilities/add-daily",
  },
  {
    id: uniqueId(),
    title: "List Daily products",
    icon: Note,
    href: "/utilities/all-daily",
  },
  {
    navlabel: true,
    subheader: "Product Type",
  },
  {
    id: uniqueId(),
    title: "Add product",
    icon: Create,
    href: "/utilities/add-product"},

    {
      id: uniqueId(),
      title: "List All products",
      icon: Note,
      href: "/utilities/list-products",
    },
  {
    navlabel: true,
    subheader: "Client",
  },
  {
    id: uniqueId(),
    title: "Client",
    icon: People,
    href: "/utilities/client",
  },
  {
    navlabel: true,
    subheader: "Shift Manager",
  },
  {
    id: uniqueId(),
    title: "Manager",
    icon: People,
    href: "/utilities/shift",
  },
  
];

export default Menuitems;
