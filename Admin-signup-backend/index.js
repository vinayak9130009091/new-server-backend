const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const dbconnect = require("./database/connectDb");
const app = express();
require("dotenv").config();

app.use(express.json());

app.use(cors());

// database connect
dbconnect();

//! Common Routes
const userRoutes = require("./routes/userRoute");
app.use("/common", userRoutes);

//! otp
const otpController = require("../../server-backend/Admin-signup-backend/middleware/otpController");
app.use("/", otpController);

// !client
const clientsignupOTPmail = require("../../server-backend/Admin-signup-backend/middleware/clientsignupOTPmail");
app.use("/", clientsignupOTPmail);
// ! admin
const adminRoutes = require("../../server-backend/Admin-signup-backend/routes/adminRoutes");
app.use("/admin", adminRoutes);

const usersavedemail = require("../../server-backend/Admin-signup-backend/middleware/usersavedemail");
app.use("/", usersavedemail);

//! resetpassword
const resetpassword = require("./controller/resetPasswordController");
app.use("/", resetpassword);

//! resetpassword
const teammemberpasswordupdate = require("../../server-backend/Admin-signup-backend/middleware/teammemberpasswordupdate");
app.use("/", teammemberpasswordupdate);

//!  Routes
const passwordupdateemail = require("../../server-backend/Admin-signup-backend/middleware/passwordupdatemail");
app.use("/", passwordupdateemail);

//! EmailTemplate Routes
const clientsavedemail = require("../../server-backend/Admin-signup-backend/middleware/clientsavedEmail");
app.use("/", clientsavedemail);

//! EmailTemplate Routes
const teammembersavedemail = require("../../server-backend/Admin-signup-backend/middleware/teamMembersendInviteEmail");
app.use("/", teammembersavedemail);

const emailsync = require("../../server-backend/Admin-signup-backend/middleware/emailsync");
app.use("/", emailsync);

app.use("/uploads", express.static("middleware/uploads"));

// firmsettinga
const firmsetting = require("./routes/firmsettingRoutes");
app.use("/", firmsetting);

const PORT = process.env.PORT || 8880;
app.listen(PORT, () => {
  console.log(`connection is live at port no. ${PORT}`);
});
