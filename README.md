# Secure file sharing service

## Getting Started

### Client

1. `cd ./client`
1. `npm i`
1. `npm start`

### Server

1. `cd ./server`
1. `mkdir -p ./ssl && openssl req -x509 -newkey rsa:2048 -nodes -keyout ./ssl/key.pem -out ./ssl/crt.pem -days 365 -subj "/CN=localhost"`
1. `mkcert -install`
1. `mkdir -p ./ssl && mkcert -key-file ./ssl/key.pem -cert-file ./ssl/crt.pem localhost 127.0.0.1 ::1`
1. `npm i`
1. `npm start`

## Roadmap

- [ ] tests to cover existing functionality
- [ ] constant response time
- [ ] constant response size
- [ ] double file extension
- [ ] prevent malicious file upload
- [ ] RSA to transport AES key from server to client
- [ ] AES key to encrypt files and send to server
- [ ] save files in encrypted form
- [ ] when user provides file key, file is decrypted and sent to user
- [ ] file is decrypted on client side
- [ ] implement rate limiting
- [ ] implement CAPTCHA response

## Contributing

This project is in its early stages, expect bugs. File an issue or pull request accordingly.

## License

MIT.
