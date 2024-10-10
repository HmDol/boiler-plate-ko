const express = require('express');
const app = express();
const port = 5000;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config/key');
const { User } = require("./models/User");


// urlencoded 형식의 데이터를 파싱하기 위해 bodyParser 사용
app.use(bodyParser.urlencoded({ extended: true }));
// JSON 형식의 데이터를 파싱하기 위해 bodyParser 사용
app.use(bodyParser.json());

// MongoDB에 연결
mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB Connected..'))
    .catch(err => console.log(err));

// 기본 라우트 설정
app.get('/', (req, res) => res.send("Hello World 반갑습니다 "));

// 회원가입 처리 라우트
app.post('/register', async (req, res) => {
    // 회원가입에 필요한 정보들을 데이터베이스에 저장
    const user = new User(req.body);

    try {
        await user.save(); // 콜백 대신 Promise를 사용하여 저장
        return res.status(200).json({
            success: true,
            // data: savedUser
        });
    } catch (err) {
        return res.json({ success: false, err });
    }
});

// 서버 시작
app.listen(port, () => console.log(`Example app listening on port ${port}`));
