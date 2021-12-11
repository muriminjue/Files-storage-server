require("dotenv").config()

const checkuser = async (req, res, next)=>{
    if (process.env.userid != req.params.userauth){
        res.status(403).json({msg: "not  allowed"})
    }else {
        next()
    }
}

module.exports = checkuser