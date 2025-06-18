# Secure file sharing service

## Getting Started

### Client

1. `cd ./client`
1. `npm i`
1. `npm run dev`

### Server

1. `cd ./server`
1. `npm i`
1. `npm run dev`

## Roadmap

- [ ] Create an SSL cert using certbot
- [ ] ufw allow port 80 and 443
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
