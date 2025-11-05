# 项目打包

## 1.打包前
### expo配置
1. 注册[expo](https://expo.dev/)
2. 点击 new project 创建项目
3. 本地安装eas-cli
 ```bash
npm install --global eas-cli
   ```
4. init项目
 ```bash
eas init --id '复制来的项目id'
   ```
### 获取Key Hash 和 SHA1
#### 生成keystore
!!!仅第一次打包需要，生成的keystore文件和设置的密码要保管好
```
keytool -genkeypair -v -keystore my-production-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```
此时项目根目录会生成一个my-production-key.keystore
#### 获取Key Hash(facebook使用) ---28位字符
```
keytool -exportcert -alias my-key-alias -keystore my-production-key.keystore | openssl sha1 -binary | openssl base64
```
输入密码即可
```
输入密钥库口令: <生成keystore时设置的密码>
OKxnqr17veMfyJWlto1r5VIGIB4=
```
#### 获取SHA1(Google使用)
```
keytool -list -v -keystore my-production-key.keystore -alias my-key-alias
```
输入密码返回
```
输入密钥库口令: <生成keystore时设置的密码>
别名: my-key-alias
创建日期: 2025年11月5日
条目类型: PrivateKeyEntry
证书链长度: 1
证书[1]:
所有者: CN=y, OU=y, O=y, L=y, ST=y, C=y
发布者: CN=y, OU=y, O=y, L=y, ST=y, C=y
序列号: d52b21702e55c1c2
生效时间: Wed Nov 05 21:27:49 CST 2025, 失效时间: Sun Mar 23 21:27:49 CST 2053
证书指纹:
	 SHA1: 38:AC:67:AA:BD:7B:BD:E3:1F:C8:95:A5:B6:8D:6B:E5:52:06:20:1E
	 SHA256: 48:82:85:72:12:6E:FB:6F:0D:68:20:9F:8C:C6:00:D8:5E:45:B0:E6:C8:5E:A9:F4:B6:75:6F:70:A3:06:9D:42
签名算法名称: SHA256withRSA
主体公共密钥算法: 2048 位 RSA 密钥
```
### 将获取的Key Hash 和 SHA1 配置到facebook和Google的控制台

## 2.打包
### 1. 安卓
 ```bash
eas build -p android --profile production
```
#### 上传keystore文件
   第一次build命令行会提问
  ```
  ? Generate a new Android Keystore? › (Y/n)
  ```
  输入n
  然后依次填入以下内容
  ```
✔ Path to the Keystore file. … my-production-key.keystore
✔ Keystore password … ******
✔ Key alias … my-key-alias
✔ Key password … ******
✔ Created keystore
  ```
  上传成功开始打包

### 2. ios
```bash
eas build --platform ios
```