<p align="center">
  <img src="./assets/logo.png" alt="Silva Baileys Logo" width="200"/>
</p>

<h1 align="center">Silva-Baileys</h1>

<p align="center">
  A fast, lightweight, full-featured WhatsApp Web API library for Node.js
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/silva-baileys"><img src="https://img.shields.io/npm/v/silva-baileys.svg?style=flat-square&color=25D366" alt="npm version"/></a>
  <a href="https://www.npmjs.com/package/silva-baileys"><img src="https://img.shields.io/npm/dm/silva-baileys.svg?style=flat-square&color=128C7E" alt="Monthly Downloads"/></a>
  <a href="https://www.npmjs.com/package/silva-baileys"><img src="https://img.shields.io/npm/dt/silva-baileys.svg?style=flat-square&color=075E54" alt="Total Downloads"/></a>
  <a href="https://github.com/SilvaTechB/silva-baileys/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="License: MIT"/></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/silva-baileys.svg?style=flat-square&color=339933" alt="Node.js Version"/></a>
  <a href="https://github.com/SilvaTechB/silva-baileys/stargazers"><img src="https://img.shields.io/github/stars/SilvaTechB/silva-baileys?style=flat-square&color=yellow" alt="GitHub Stars"/></a>
</p>

---

## Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or affiliates. Use at your own discretion. Do not spam people with this. We discourage any stalkerware, bulk or automated messaging usage.

---

## Installation

```bash
npm install silva-baileys
```

```bash
yarn add silva-baileys
```

---

## Quick Start

### CommonJS

```javascript
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('silva-baileys')
```

### ES Modules / TypeScript

```javascript
import pkg from 'silva-baileys'
const { default: makeWASocket, useMultiFileAuthState, Browsers } = pkg
```

---

## Basic Usage

```javascript
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('silva-baileys')
const { Boom } = require('@hapi/boom')

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('Connection closed, reconnecting:', shouldReconnect)
            if (shouldReconnect) connectToWhatsApp()
        } else if (connection === 'open') {
            console.log('Connected!')
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.key.fromMe && msg.message) {
            console.log('New message:', msg.message)
        }
    })
}

connectToWhatsApp()
```

---

## Features

- Full WhatsApp Web API support
- Multi-device support with QR code and pairing code authentication
- LID (Link ID) addressing support for both personal chats and groups
- Group status/story sending
- Session management and restoration
- Send & receive messages, media, documents, stickers
- Group management
- Privacy settings control
- Profile management
- Newsletter support
- And much more!

---

## API Reference

### `makeWASocket(config)`

Creates a new WhatsApp socket connection.

| Option | Type | Description |
|--------|------|-------------|
| `auth` | `AuthenticationState` | Auth state from `useMultiFileAuthState` |
| `printQRInTerminal` | `boolean` | Print QR code in the terminal |
| `browser` | `[string, string, string]` | Browser identity tuple |
| `logger` | `Logger` | Custom pino logger instance |

### `useMultiFileAuthState(folder)`

Manages authentication state using multiple files in a folder.

```javascript
const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
```

### Sending Messages

```javascript
// Text message
await sock.sendMessage(jid, { text: 'Hello!' })

// Image with caption
await sock.sendMessage(jid, { image: { url: './image.jpg' }, caption: 'Look at this!' })

// Video
await sock.sendMessage(jid, { video: { url: './video.mp4' }, caption: 'Check this out' })

// Reply to a message
await sock.sendMessage(jid, { text: 'This is a reply' }, { quoted: msg })

// Send with mentions
await sock.sendMessage(jid, { text: '@user', mentions: [userJid] })
```

---

## License

MIT — see [LICENSE](./LICENSE) for details.
