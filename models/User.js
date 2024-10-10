const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, // 빈칸을 없애줌
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
});

// 비밀번호 저장 전에 암호화하는 미들웨어
userSchema.pre('save', function (next) {
    var user = this;

    // 비밀번호가 변경될 때만 암호화
    if (user.isModified('password')) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);

                user.password = hash;
                next(); // 모든 처리가 끝난 후 next() 호출
            });
        });
    } else {
        // 비밀번호가 변경되지 않았을 경우 next()를 바로 호출
        next();
    }
});

userSchema.methods.comparePassword = function (plainPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
            if (err) return reject(err);
            resolve(isMatch);
        });
    });
};


userSchema.methods.generateToken = async function () {
    var user = this;

    try {
        // JSON Web Token 생성
        var token = jwt.sign(user._id.toHexString(), 'secretToken');
        user.token = token;

        // user 저장 (await 사용)
        await user.save();
        return user;  // 저장된 유저 반환
    } catch (err) {
        throw new Error(err);
    }
};



userSchema.statics.findByToken = async function (token) {
    const user = this;

    try {
        // 1. 토큰을 비동기적으로 디코딩
        const decoded = await jwt.verify(token, 'secretToken');

        // 2. 디코딩된 _id와 토큰으로 사용자를 찾는다
        const foundUser = await user.findOne({ "_id": decoded, "token": token });

        // 3. 찾은 사용자를 반환한다
        return foundUser;
    } catch (err) {
        // 에러가 발생하면 null 반환
        return null;
    }
};


userSchema.statics.findByToken = async function (token) {
    var user = this;

    try {
        // 1. 토큰을 decode한다 (jwt.verify를 Promise로 처리)
        const decoded = await jwt.verify(token, 'secretToken');

        // 2. 유저 아이디와 토큰을 이용해 유저를 찾는다
        const foundUser = await user.findOne({ "_id": decoded, "token": token });

        // 3. 유저를 반환한다
        return foundUser;
    } catch (err) {
        // 에러가 발생한 경우 에러를 반환
        throw err;
    }
};





const User = mongoose.model('User', userSchema);

module.exports = { User };
