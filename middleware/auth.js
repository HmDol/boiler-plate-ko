const { User } = require("../models/User");

let auth = async (req, res, next) => {
    try {
        // 클라이언트 쿠키에서 토큰을 가져온다
        let token = req.cookies.x_auth;

        // 토큰을 복호화한 후 유저를 찾는다
        const user = await User.findByToken(token);

        if (!user) {
            return res.json({ isAuth: false, error: true });
        }

        // 사용자 정보와 토큰을 요청 객체에 담는다
        req.token = token;
        req.user = user;

        // 다음 미들웨어로 이동
        next();

    } catch (err) {
        // 에러 발생 시 클라이언트에 에러 반환
        return res.status(500).json({ isAuth: false, error: err.message });
    }
}

module.exports = { auth };
