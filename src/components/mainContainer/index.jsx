import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import "./maincontainer.css";
import { useSelector } from "react-redux";
import { useMemo } from "react";
import { motion } from "framer-motion";
import DataTable from "../DataTable";
const columns = [
  {
    accessorKey: "sender",
    header: "From",
    size: 10,
    layoutMode: "grid-no-grow",
  },
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    accessorKey: "body",
    header: "Body",
    size: 100,
    layoutMode: "grid-no-grow",
  },
];

const MainContent = () => {
  const user = useSelector(({ user }) => user);
  const { sent, received } = useMemo(() => {
    const sent = [];
    const received = [];
    for (const email of user.emailContent) {
      if (email.sender === user.email) {
        sent.push({ ...email, id: email._id });
      } else received.push({ ...email, id: email._id });
    }
    return { sent, received };
  }, [user.email, user.emailContent]);

  return (
    <motion.div
      // initial={{ scale: 0, opacity: 0 }}
      // animate={{ scale: 1, opacity: 1 }}
      // transition={{ duration: 0.3, type: "spring" }}
      className="main-email-container"
    >
      <DataTable data={received} columns={columns} />
    </motion.div>
  );
};

export default MainContent;
