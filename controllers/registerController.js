const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const dbCon = require("../dbConnection").promise();

exports.register = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const [row] = await dbCon.execute(
      "SELECT `email` FROM `admin_user` WHERE `email`=?",
      [req.body.email]
    );

    if (row.length > 0) {
      return res.status(201).json({
        message: "The E-mail already in use",
      });
    }

    const hashPass = await bcrypt.hash(req.body.password, 12);

    const [rows] = await dbCon.execute(
      "INSERT INTO `admin_user`(`username`,`email`,`password`) VALUES(?,?,?)",
      [req.body.username, req.body.email, hashPass]
    );

    if (rows.affectedRows === 1) {
      return res.status(201).json({
        message: "The user has been successfully inserted.",
      });
    }
  } catch (err) {
    next(err);
  }
};
