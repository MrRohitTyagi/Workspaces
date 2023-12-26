import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import "./maincontainer.css";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import DataTable from "../DataTable";
import { useAuth0 } from "@auth0/auth0-react";
import { confugureUser } from "../../controllers/userController";
import "./customDataTable.css";
import { Checkbox, Divider, IconButton, Skeleton } from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
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

const MainContainer = () => {
  const { user } = useAuth0();
  const [emailData, setEmailData] = useState(undefined);

  const sortData = useCallback(
    (allEmails) => {
      const emails = [];
      for (const em of allEmails) {
        if (em.recipients.includes(user.email)) {
          emails.push(em);
        }
      }

      return emails;
    },
    [user.email]
  );
  const fetchData = useCallback(async () => {
    setEmailData(undefined);
    const { response } = await confugureUser(user.name, user.email);
    const data = sortData(response?.emailContent || []);
    setEmailData(data);
  }, [sortData, user.email, user.name]);

  useEffect(() => {
    (async function fetchUser() {
      if (user) {
        fetchData(user);
      }
    })();
  }, [fetchData, sortData, user]);

  return (
    <motion.div className="main-email-container">
      {emailData === undefined ? (
        <CustomDataTableSkeletonLoader />
      ) : emailData.length === 0 ? (
        <>No Data</>
      ) : (
        // <DataTable data={emailData} columns={columns} />
        <CustomDataTable data={emailData || []} fetchData={fetchData} />
      )}
    </motion.div>
  );
};

const CustomDataTable = ({ data = [], fetchData }) => {
  console.log(`%c data `, "color: yellow;border:1px solid lightgreen", data);
  return (
    <div className="email-container">
      <div className="filters-comp">
        <IconButton onClick={fetchData}>
          <RefreshIcon />
        </IconButton>
      </div>
      <div className="all-email-container">
        {data.map(({ subject, id, body }) => {
          return (
            <div key={id} className="email-row">
              <div className="">
                <Checkbox size="small" />
                <IconButton sx={{ padding: "2px" }} disableRipple>
                  <StarBorderIcon />
                </IconButton>
                <IconButton sx={{ padding: "2px" }} disableRipple>
                  <DeleteForeverIcon color="error" />
                </IconButton>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="subject-box"
              >
                {subject?.slice(0, 15)}
                {subject?.length > 15 ? "..." : ""}
              </motion.div>
              <div className="divider" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="body-box"
              >
                {body}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
const CustomDataTableSkeletonLoader = ({ data = [1, 2, 3, 4, 5, 6] }) => {
  console.log(`%c data `, "color: yellow;border:1px solid lightgreen", data);
  return (
    <div className="email-container">
      <div className="filters-comp"></div>
      <div className="all-email-container">
        {data.map((_, i) => {
          return (
            <div key={i} className="email-row skeleton-row">
              <Skeleton animation="wave" height={"100%"} width={"100%"} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default MainContainer;
