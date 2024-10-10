const express = require('express');
const app = express();
const port = 5000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const cookieparser = require('cookie-parser');
const { User } = require("./models/User");


// urlencoded 형식의 데이터를 파싱하기 위해 bodyParser 사용
app.use(bodyParser.urlencoded({ extended: true }));
// JSON 형식의 데이터를 파싱하기 위해 bodyParser 사용
app.use(bodyParser.json());
app.use(cookieparser());



// MongoDB에 연결
mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB Connected..'))
    .catch(err => console.log(err));

// 기본 라우트 설정
app.get('/', (req, res) => res.send("Hello World 반갑습니다 "));

app.get('/api/users/logout', auth, async (req, res) => {
    try {
        // _id에 해당하는 유저의 token을 빈 값으로 업데이트
        await User.findOneAndUpdate(
            { _id: req.user._id }, // 찾을 조건
            { token: "" } // 업데이트할 값
        );

        // 업데이트가 성공하면 성공 메시지 반환
        return res.status(200).send({
            success: true
        });
    } catch (err) {
        // 에러 발생 시 에러 메시지 반환
        return res.json({ success: false, err });
    }
});


// 회원가입 처리 라우트
app.post('/api/users/register', async (req, res) => {
    // 회원가입에 필요한 정보들을 데이터베이스에 저장
    console.log("Received Data:", req.body);  // 요청 본문에 있는 데이터를 로그로 출력,test를 위함
    const user = new User(req.body);
    try {
        await user.save(); // 콜백 대신 Promise를 사용하여 저장
        return res.status(200).json({
            success: true,

        });
    } catch (err) {
        return res.json({ success: false, err });
    }
});

app.post('/api/users/auth', auth, async (req, res) => {
    //여기 까지 미들웨어를 통과했다는 것은 authentication 이 true라는 말
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image

    })
})

app.post('/api/users/login', async (req, res) => {
    try {
        // 1. 요청된 이메일을 데이터베이스에서 찾는다
        const user = await User.findOne({ email: req.body.email }); // async/await 사용

        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            });
        }

        // 2. 이메일이 있으면 비밀번호가 맞는지 확인한다
        const isMatch = await user.comparePassword(req.body.password);

        if (!isMatch) {
            return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다" });
        }

        // 3. 비밀번호까지 맞다면 토큰을 생성한다
        const tokenUser = await user.generateToken();

        // 토큰을 쿠키에 저장한다
        res.cookie("x_auth", tokenUser.token)
            .status(200)
            .json({ loginSuccess: true, userId: tokenUser._id });

    } catch (err) {
        return res.status(400).send(err);
    }
});




// 서버 시작
app.listen(port, () => console.log(`Example app listening on port ${port}`));
