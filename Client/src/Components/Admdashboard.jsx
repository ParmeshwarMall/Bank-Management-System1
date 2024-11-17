import "../../public/CSS/Dashboard.css";
import Button from "@mui/material/Button";
import { NavLink } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

export default function Admdashboard(props) {
  const [users, setUsers] = useState({ currUsers: 0, totalTransaction: 0 });
  const [displayedUsers, setDisplayedUsers] = useState(0);
  const [displayedTransactions, setDisplayedTransactions] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const toastId = toast.loading("Fetching details, please wait...", {
          position: "top-center",
        });
        const response = await axios.get(`${props.api}/allusers`);
        const { totalUsers, totalTransactions } = response.data;
        setUsers({ currUsers: totalUsers, totalTransaction: totalTransactions });
        toast.dismiss(toastId);
        toast.info("Details fetch successfully", {
          position: "top-center",
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, [props.api]);

  useEffect(() => {
    if (users.currUsers > 0) {
      const duration = 100;
      const incrementUsers = users.currUsers / duration;
      const incrementTransactions = users.totalTransaction / duration;
      
      let userCount = 0;
      let transactionCount = 0;

      const interval = setInterval(() => {
        userCount += incrementUsers;
        transactionCount += incrementTransactions;

        setDisplayedUsers(Math.min(Math.ceil(userCount), users.currUsers));
        setDisplayedTransactions(Math.min(Math.ceil(transactionCount), users.totalTransaction));

        if (userCount >= users.currUsers && transactionCount >= users.totalTransaction) {
          clearInterval(interval);
        }
      }, 1); 

      return () => clearInterval(interval); 
    }
  }, [users.currUsers, users.totalTransaction]);

  return (
    <div className="admdashboard">
      <div className="container7">
        <br />
        <h1 className="dash-mainhead">Welcome To the Dashboard</h1>
        <div className="users">
          <div className="usersnumber">
            <h3>{`Number of active users: ${displayedUsers}`}</h3>
            <div className="accInfo1">
            <h4>Check All Users</h4>
            <NavLink to="/allusers">
              <Button variant="outlined" id="accbtn">
                Click here
              </Button>
            </NavLink>
          </div>
          </div>
          <div className="userstrans">
            <h3>{`Total number of transactions: ${displayedTransactions}`}</h3>
            <div className="accInfo1">
            <h4>Check All Transactions</h4>
            <NavLink to="/alltransactions">
              <Button variant="outlined" id="accbtn">
                Click here
              </Button>
            </NavLink>
          </div>
          </div>
        </div>
        <div className="container71">
          <div className="accInfo1">
            <h3>For New Acc Open</h3>
            <NavLink to="/form">
              <Button variant="outlined" id="accbtn">
                Click here
              </Button>
            </NavLink>
          </div>
          <div className="accInfo1">
            <h3>Check Balance</h3>
            <NavLink to="/balance">
              <Button variant="outlined" id="accbtn">
                Click here
              </Button>
            </NavLink>
          </div>
          <div className="accInfo1">
            <h3>For Deposite</h3>
            <NavLink to="/deposite">
              <Button variant="outlined" id="accbtn">
                Click here
              </Button>
            </NavLink>
          </div>
          <div className="accInfo1">
            <h3>For Withdraw</h3>
            <NavLink to="/withdraw">
              <Button variant="outlined" id="accbtn">
                Click here
              </Button>
            </NavLink>
          </div>
          <div className="accInfo1">
            <h3>For Money Transfer</h3>
            <NavLink to="/transfer">
              <Button variant="outlined" id="accbtn">
                Click here
              </Button>
            </NavLink>
          </div>
          <div className="accInfo1">
            <h3>For Transaction History</h3>
            <NavLink to="/transaction">
              <Button variant="outlined" id="accbtn">
                Click here
              </Button>
            </NavLink>
          </div>
          <div className="accInfo1">
            <h3>For Check Details</h3>
            <NavLink to="/detail">
              <Button variant="outlined" id="accbtn">
                Click here
              </Button>
            </NavLink>
          </div>
          <div className="accInfo1">
            <h3>For Update Details</h3>
            <NavLink to="/updtdetail">
              <Button variant="outlined" id="accbtn">
                Click here
              </Button>
            </NavLink>
          </div>
          <div className="accInfo1">
            <h3>For Delete Account</h3>
            <NavLink to="/delete">
              <Button variant="outlined" id="accbtn">
                Click here
              </Button>
            </NavLink>
          </div>
        </div>
        <Button variant="outlined" id="homebtn" href="/">
          Logout
        </Button>
      </div>
    </div>
  );
}
