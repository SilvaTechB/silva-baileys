# Silva-Baileys

A WebSocket-based JavaScript library for interacting with the WhatsApp Web API.

[![npm version](https://img.shields.io/npm/v/silva-baileys.svg)](https://www.npmjs.com/package/silva-baileys)
[![npm downloads](https://img.shields.io/npm/dm/silva-baileys.svg)](https://www.npmjs.com/package/silva-baileys)
[![License](https://img.shields.io/npm/l/silva-baileys.svg)](https://github.com/silvagift/silva-baileys/blob/main/LICENSE)

> Forked from [gifted-baileys](https://www.npmjs.com/package/gifted-baileys) by [Gifted Tech](https://baileys.giftedtech.co.ke) with permission.

## Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or affiliates. Use at your own discretion. Do not spam people with this. We discourage any stalkerware, bulk or automated messaging usage.

## Installation

```bash
npm install silva-baileys
```

Or using yarn:

```bash
yarn add silva-baileys
```

## Quick Start

### CommonJS (Recommended)

```javascript
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('silva-baileys')
```

### ES Modules / TypeScript

```javascript
import pkg from 'silva-baileys'
const { default: makeWASocket, useMultiFileAuthState, Browsers } = pkg
```

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

## Features

- Full WhatsApp Web API support
- Multi-device support with QR code and pairing code authentication
- LID (Link ID) addressing support for both personal chats and groups
- Group status/story sending functionality
- Session management and restoration
- Message sending, receiving, and manipulation
- Group management
- Privacy settings
- Profile management
- And much more!

## API

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
// Send a text message
await sock.sendMessage(jid, { text: 'Hello!' })

// Send an image
await sock.sendMessage(jid, { image: { url: './image.jpg' }, caption: 'Look at this!' })

// Send a video
await sock.sendMessage(jid, { video: { url: './video.mp4' }, caption: 'Check this out' })

// Reply to a message
await sock.sendMessage(jid, { text: 'This is a reply' }, { quoted: msg })
```

## Credits

This package is a fork of [gifted-baileys](https://www.npmjs.com/package/gifted-baileys), originally created by [Gifted Tech](https://baileys.giftedtech.co.ke). Forked with permission.

The original Baileys library was created by [@adiwajshing](https://github.com/adiwajshing) and is maintained by [WhiskeySockets](https://github.com/WhiskeySockets/Baileys).

## License

MIT — see [LICENSE](./LICENSE) for details.
