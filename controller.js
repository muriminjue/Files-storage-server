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
  console.log(mailOptions)
  await transporter.sendMail(mailOptions, function (error, info) {
    console.log(error, info)
  })

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
    if (name == "upload" || name == "read") {
      try {
        await prisma.user.create({ data: { authkey: authkey, role: name } });
        res.status(200).json({ authkey: authkey, msg: "success" });
      } catch (e) {
        res.status(500).json({ msg: "there was a problem creating user" });
      }
    } else {
      console.log(name)
      res.status(400).json({ msg: "Uknown name" });
    }
  }
};

const getusers = async (req, res) => {
  try {
    let allusers = await prisma.user.findMany(), subjext = "User details request", text = JSON.stringify(allusers)

    await sendemail(subjext, text)
    res.status(200).json({ msg: "user details emailed to the admin account" })
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
    let subject = "Delete user request", text = JSON.stringify(user)
    await sendemail(subject, text);
    res.status(200).json({ msg: "User delete request has been sent to admin" });
  } else {
    res.status(404).json({ msg: "User not found" });
  }
};

const uploadfile = async (req, res) => {
  
  let file = req.files.file
  user = await prisma.user.findUnique({
    where: {
      authkey: req.params.userkey,
    },
  });

  if (user.role == "upload" || file != "") {
    try {
      await file.mv("public/" + file.name)
      await prisma.file.create({
        data: { userId: user.id, name: file.name },
      });
      res.status(200).json({ msg: "Upload succesful" });
    } catch (e) {
      let subject = "Error saving files", text = "could not load file due to: " + e
      await sendemail(subject, text);
      res.status(500).json({ msg: "there was a problem uploading files" });
      console.log(e);
    }
  } else {
    res.status(403).json({ msg: "User lacks priveledges" });
  }
};

module.exports = { uploadfile, adduser, deluser, getusers };
