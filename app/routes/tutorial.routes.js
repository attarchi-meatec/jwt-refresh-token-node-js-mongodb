const { authJwt } = require("../middlewares");
const tutorials = require("../controllers/tutorial.controller");

module.exports = app => {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  var router = require("express").Router();

  // READ — any authenticated user (user, moderator, admin)
  router.get("/", [authJwt.verifyToken], tutorials.findAll);
  router.get("/published", [authJwt.verifyToken], tutorials.findAllPublished);
  router.get("/:id", [authJwt.verifyToken], tutorials.findOne);

  // CREATE / UPDATE — moderator or admin
  router.post("/", [authJwt.verifyToken, authJwt.isModeratorOrAdmin], tutorials.create);
  router.put("/:id", [authJwt.verifyToken, authJwt.isModeratorOrAdmin], tutorials.update);

  // DELETE — admin only
  router.delete("/:id", [authJwt.verifyToken, authJwt.isAdmin], tutorials.delete);
  router.delete("/", [authJwt.verifyToken, authJwt.isAdmin], tutorials.deleteAll);

  app.use("/api/tutorials", router);
};
