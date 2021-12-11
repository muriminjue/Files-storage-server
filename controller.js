const { PrismaClient } = require("@prisma/client");
const randomstring = require("randomstring");
const dotenv = require("dotenv");
const transporter = require("./emailconfig");

dotenv.config();

const prisma = new PrismaClient();

const sendemail = async (subject, text) => {
  let mailOptions = {
    from: '"Crostech File-server" <bp.admin@crosstechfoods.co.ke>',
    to: process.env.adminemail,
    subject: subject,
    text: text,
  };
  await transporter.sendMail(mailOptions, function (error, info) {
    console.log(error, info);
  });
};

const adduser = async (req, res) => {
  let authkey = randomstring.generate(16),
    name = req.body.name,
    existinguser = await prisma.user.findUnique({
      where: {
        authkey: authkey,
      },
    });

  if (existinguser) {
    authkey = randomstring.generate(17);
  } else {
    if (name.includes("poster", "reader")) {
      try {
        await prisma.user.create({ data: { authkey: authkey, role: name } });
        res.status(200).json({ msg: "success" });
      } catch (e) {
        res.status(500).json({ msg: "there was a problem creating user" });
      }
    } else {
      res.status(400).json({ authkey: authkey, msg: "Uknown name" });
    }
  }
};

const getusers = async (res) => {
  try {
    const allUsers = await prisma.user.findMany();
    await sendemail({ Subject: "User details request", text: allusers });
    res.status(200).json({ msg: "user details emailed to the admin account" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: "there was a problem getting users" });
  }
};

const deluser = async (req, res) => {
  let user = await prisma.user.findUnique({
    where: {
      authkey: req.params.userkey,
    },
  });
  if (user) {
    await sendemail({ Subject: "Delete user request", text: user });
    res.status(200).json({ msg: "User delete request has been sent to admin" });
  } else {
    res.status(404).json({ msg: "User not found" });
  }
};

const uploadfile = async (req, res) => {
  let files = req.files,
    user = await prisma.user.findUnique({
      where: {
        authkey: req.params.userkey,
      },
    });
  if (user.role == poster) {
    try {
      await files.forEach((element) => {
        element.mv("public/" + element.name);
      });
      await prisma.user.create({
        data: { userId: user.id, name: element.name },
      });
      res.status(200).json({ msg: "Upload succesful" });
    } catch (e) {
      res.status(500).json({ msg: "there was a problem uploading files" });
      await sendemail({ Subject: "Error saving files", text: e });
      console.log(e);
    }
  } else {
    res.status(403).json({ msg: "User lacks priveledges" });
  }
};

module.exports = { uploadfile, adduser, deluser, getusers };
