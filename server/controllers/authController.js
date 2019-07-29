const axios = require("axios");
const User = require("../collections/users");
module.exports = {
  auth: (req, res) => {
    let payload = {
      client_id: process.env.REACT_APP_AUTH0_CLIENT_ID,
      code: req.query.code,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: `http://${req.headers.host}/callback`
    };

    function exchangeCodeForAccessToken() {
      return axios.post(
        `https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`,
        payload
      );
    }

    function exchangeAccessTokenForUserInfo(accessTokenResponse) {
      const accessToken = accessTokenResponse.data.access_token;
      return axios.get(
        `https://${
          process.env.REACT_APP_AUTH0_DOMAIN
        }/userinfo/?access_token=${accessToken}`
      );
    }

    function setUserToSessionGetAuthAccessToken(userInfoResponse) {
      req.session.user = userInfoResponse.data;

      body = {
        grant_type: "client_credentials",
        client_id: process.env.AUTH0_API_CLIENT_ID,
        client_secret: process.env.AUTH0_API_CLIENT_SECRET,
        audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/`
      };
      return axios.post(
        `https://${process.env.REACT_APP_AUTH0_DOMAIN}/oauth/token`,
        body
      );
    }

    function getGitAccessToken(authAccessTokenResponse) {
      let options = {
        headers: {
          authorization: `Bearer ${authAccessTokenResponse.data.access_token}`
        }
      };
      return axios.get(
        `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/users/${
          req.session.user.sub
        }`,
        options
      );
    }

    function setGitTokenToSessions(gitAccessToken) {
      const { name, picture, nickname, email } = gitAccessToken.data;
      console.log("email============", email);
      User.find({ email: email }).then(user => {
        console.log("user.length", user);
        if (user.length) {
          console.log("hit inside mongo found auth", user);
          req.session.access_token =
            gitAccessToken.data.identities[0].access_token;
          req.session.user = {
            id: user._id,
            email,
            name,
            picture,
            accountName: nickname,
            room: "",
            rooms: user.rooms
          };

          res.redirect("/");
        } else {
          const newUser = new User({
            email,
            rooms: []
          });

          newUser.save(err => {
            console.log(err);
            User.find({ email })
              .then(user => {
                console.log("hit inside mongo auth new", user);
                req.session.access_token =
                  gitAccessToken.data.identities[0].access_token;
                req.session.user = {
                  id: user._id,
                  email,
                  name,
                  picture,
                  accountName: nickname,
                  room: "",
                  rooms: user.rooms
                };

                res.redirect("/");
              })
              .catch(err => console.log(err));
          });
        }
      });
      console.log(email);
    }

    exchangeCodeForAccessToken()
      .then(accessTokenResponse =>
        exchangeAccessTokenForUserInfo(accessTokenResponse)
      )
      .then(userInfoResponse =>
        setUserToSessionGetAuthAccessToken(userInfoResponse)
      )
      .then(authAccessTokenResponse =>
        getGitAccessToken(authAccessTokenResponse)
      )
      .then(gitAccessToken => setGitTokenToSessions(gitAccessToken))
      .catch(err => console.log(err));
  },
  userInfo: (req, res, next) => {
    res.status(200).send(req.session.user);
  },
  logout: (req, res, next) => {
    req.session.destroy();
    res.end();
  }
};
