const express = require("express");
const cors = require("cors");
const port = 8000;
const mongoose = require("mongoose");
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    // origin:"https://bharat-bank.netlify.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
app.use(cookieParser());

require('dotenv').config();

const secretKey = process.env.SECRET_KEY;
const mongoUrl1 = process.env.MONGO_URL1;
const mongoUrl2 = process.env.MONGO_URL2;

main()
  .then(() => {
    console.log("Connection success");
  })
  .catch((err) => console.log(err));

// async function main() {
//   await mongoose.connect(mongoUrl2);
// }

async function main() {
  await mongoose.connect(mongoUrl1);
}

const userSchema = mongoose.Schema({
  name: String,
  fname: String,
  dob: String,
  email: String,
  contact: Number,
  aadhaar: Number,
  pan: String,
  username: String,
  password: String,
  image: String,
  signature: String,
  acctype: String,
  amount: Number,
  add: String,
});

const userTrans = mongoose.Schema({
  username: String,
  amount: Number,
  mode: String,
  transdate: String,
  transtime: String,
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const User = mongoose.model("users", userSchema);
const Transaction = mongoose.model("transactions", userTrans);

var currentDate = new Date();

var day = currentDate.getDate();
var month = currentDate.getMonth() + 1; // Months are zero-indexed, so January is 0
var year = currentDate.getFullYear();

var hours = currentDate.getHours();
var minutes = currentDate.getMinutes();
var seconds = currentDate.getSeconds();

const verifyToken = async (req, res, next) => {
  const token = await req.cookies.token;

  if (!token) {
    return res.status(403).send('Token is required');
  }

  try {
    const decoded = jwt.verify(token, secretKey); 
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send('Invalid token');
  }
};

app.post("/", async (req, res) => {
  const { username, userpassword } = req.body;

  try {
    const userExist = await User.findOne({ username });
    if (!userExist) {
      return res.send("Invalid Username");
    }

    const isPassCrt = await bcrypt.compare(userpassword, userExist.password);
    if (isPassCrt) {
      const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
      res.cookie('token', token, {
        httpOnly: true,
        secure: true, // true if using HTTPS
        sameSite: 'None', // Required for cross-origin cookies
      });
      return res.send("exist");
    } else {
      return res.send("Invalid Password");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred. Please try again later.");
  }
});

app.post(
  "/form",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  async (req, res) => {
    const {
      name,
      fname,
      dob,
      email,
      contact,
      aadhaar,
      pan,
      username,
      password,
      acctype,
      amount,
      add,
    } = req.body;

    try {
      const userExist = await User.findOne({ username: username });
      if (userExist) {
        res.send("exist");
      } else {
        const hashPass = await bcrypt.hash(password, 12);
        const newUser = new User({
          name,
          fname,
          dob,
          email,
          contact,
          aadhaar,
          pan,
          username,
          password: hashPass,
          image: req.files.image[0].path,
          signature: req.files.signature[0].path,
          acctype,
          amount,
          add,
        });
        const newTrans = new Transaction({
          username,
          amount,
          mode: "Credit",
          transdate: day + "/" + month + "/" + year,
          transtime: hours + ":" + minutes + ":" + seconds,
        });
        await newUser.save();
        await newTrans.save();

        const transporter = nodemailer.createTransport({
          service: "gmail",
          secure: true,
          port: 465,
          auth: {
            user: "parmeshwarmall1920@gmail.com",
            pass: "omns gzzy ibch nhsl",
          },
        });
        async function main() {
          const info = await transporter.sendMail({
            from: " <parmeshwarmall1920@gmail.com>",
            to: email,
            subject: "Welcome to Bharat Bank!",
            html: `<h3>Dear ${name}</h3>
                           <p>Thank you for choosing <strong>Bharat Bank</strong> for your banking needs. We're thrilled to welcome you to our community!</p>
                           <p>Your new account has been successfully opened, and we're here to assist you every step of the way. Whether you have questions about your account, need assistance with banking services, or want to explore our range of products, our dedicated team is ready to help.</p>
                           <p>If you haven't already, you'll soon receive a welcome packet with important information about your account. In the meantime, feel free to explore our online banking platform and familiarize yourself with the features available to you.</P>
                           <br/>
                           <p>Warm regards,<p/>
                           <p>Parmeshwar Mall</p>
                           <p>Bharat Bank</p>
                           <p>7706811920</p>`,
          });
        }
        main().catch(console.error);

        res.send("Account Open Successfully");
      }
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
);

app.post("/balance", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      const isPassCrt = await bcrypt.compare(password, user.password);
      if (isPassCrt) {
        const amount = user.amount;
        res.send("Your current amount is: " + amount.toString());
      } else {
        res.send("Invalid Password");
      }
    } else {
      res.send("Invalid Username");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/deposite", async (req, res) => {
  const { amount, username, password } = req.body;
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      const isPassCrt = await bcrypt.compare(password, user.password);
      if (isPassCrt) {
        const newAmount = user.amount + Number(amount);
        user.amount = newAmount;
        const newTrans = new Transaction({
          username,
          amount,
          mode: "Credit",
          transdate: day + "/" + month + "/" + year,
          transtime: hours + ":" + minutes + ":" + seconds,
        });
        await user.save();
        await newTrans.save();
        res.send(user.amount.toString());
      } else {
        res.send("InvalidP");
      }
    } else {
      res.send("InvalidU");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/withdraw", async (req, res) => {
  const { amount, username, password } = req.body;
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      const isPassCrt = await bcrypt.compare(password, user.password);
      if (isPassCrt) {
        if (user.amount >= amount) {
          user.amount -= Number(amount);
          const newTrans = new Transaction({
            username,
            amount,
            mode: "Debit",
            transdate: day + "/" + month + "/" + year,
            transtime: hours + ":" + minutes + ":" + seconds,
          });
          await user.save();
          await newTrans.save();
          res.send(
            "Withdraw Successfully. Your current amount is: " +
              user.amount.toString()
          );
        } else {
          res.send("Your balance is less than withdraw amount");
        }
      } else {
        res.send("Invalid Password");
      }
    } else {
      res.send("Invalid Username");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/transfer", async (req, res) => {
  const { senusername, password, recusername, amount } = req.body;
  try {
    const sen = await User.findOne({ username: senusername });
    const rec = await User.findOne({ username: recusername });
    if (sen && rec) {
      const isPassCrt = await bcrypt.compare(password, sen.password);
      if (isPassCrt) {
        if (sen.amount >= amount) {
          sen.amount -= Number(amount);
          rec.amount += Number(amount);
          const senNewTrans = new Transaction({
            username: senusername,
            amount,
            mode: "Debit",
            transdate: day + "/" + month + "/" + year,
            transtime: hours + ":" + minutes + ":" + seconds,
          });
          const recNewTrans = new Transaction({
            username: recusername,
            amount,
            mode: "Credit",
            transdate: day + "/" + month + "/" + year,
            transtime: hours + ":" + minutes + ":" + seconds,
          });
          await sen.save();
          await rec.save();
          await senNewTrans.save();
          await recNewTrans.save();
          res.send("Money transfer successfully");
        } else {
          res.send("Your current balance is low to complete this transaction");
        }
      } else {
        res.send("Invalid Password");
      }
    } else {
      res.send("Invalid Username");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/delete", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      const isPassCrt = await bcrypt.compare(password, user.password);
      if (isPassCrt) {
        await user.deleteOne();
        await Transaction.deleteMany({ username: username });
        res.send("Account delete successfully");
      } else {
        res.send("Invalid Password");
      }
    } else {
      res.send("Invalid Username");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/transaction",async(req,res)=>{
  const {username,password}=req.body;
  try {
    const transaction = await Transaction.find({ username: username });
    if (transaction) {
        res.send(transaction);
      }
    else {
      res.send("InvalidU");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
})

app.get("/usertransaction", verifyToken, async (req, res) => {
  try {
      const transactions = await Transaction.find({ username: req.user.username });
      res.send(transactions);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/passchg", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      user.password = await bcrypt.hash(password, 12);
      await user.save();
      res.send("Password change successfully!");
    } else {
      res.send("Invalid username");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/userdetail", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username });
    if (user) {
      const isPassCrt = await bcrypt.compare(password, user.password);
      if (isPassCrt) {
        res.send(user);
      } else {
        res.send("InvalidP");
      }
    } else {
      res.send("InvalidU");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.get("/detail", verifyToken, async (req, res) => {

  try {
    const user = await User.findOne({ username: req.user.username });
    res.send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/updtdetail", async (req, res) => {
  const { ousername, nusername, email, contact, add } = req.body;
  try {
    const user = await User.findOne({ username: ousername });
    if (user) {
      user.email = email;
      user.contact = contact;
      user.username = nusername;
      user.add = add;
      await user.save();
      const updTrans = await Transaction.find({ username: ousername });
      for (let i of updTrans) {
        i.username = nusername;
        await i.save();
      }
      //await updTrans.save();
      res.send("Update details successfully");
    } else {
      res.send("Invalid");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/email", async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username: username });
  const email = user.email;
  const transaction = await Transaction.find({ username: username });
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: "parmeshwarmall1920@gmail.com",
      pass: "omns gzzy ibch nhsl",
    },
  });

  let tableRows = "";
  transaction.forEach((i) => {
    tableRows += `
            <tr>
                <td>${i.amount}</td>
                <td>${i.mode}</td>
                <td>${i.transdate}</td>
                <td>${i.transtime}</td>
            </tr>
            `;
  });

  async function main() {
    const info = await transporter.sendMail({
      from: " <parmeshwarmall1920@gmail.com>",
      to: email,
      subject: "Hello from Bharat Bank",
      html: `
                <h2> Transaction History </h2>
                <table border="3">
                    <thead>
                        <tr>
                            <th>Amount</th>
                            <th>Mode</th>
                            <th>Date</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>

                        ${tableRows}
                    </tbody>
                </table>`,
    });

    res.send("Email send successfully");
  }
  main().catch(console.error);
});

app.get("/allusers", async (req, res) => {
  try {
    const users = await User.find();
    const transactions = await Transaction.find();
    res.json({
      users,
      totalUsers: users.length,
      totalTransactions: transactions.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/alltransactions", async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/");

app.listen(port, () => {
  console.log(`Server start on port ${port}`);
});
