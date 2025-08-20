# Custom DNS Server in Node.js

This is a simple and educational DNS server implementation written in Node.js using `dgram` (UDP) and `dns-packet`.

I built this project to **understand DNS deeply**, including concepts like:
- Root servers
- DNS record types (A, CNAME, etc.)
- DNS caching
- Authoritative vs recursive DNS
- UDP communication in DNS

---

## Features

- Custom DNS server using UDP
- Handles basic `A` and `CNAME` queries
- Uses an in-memory database (`db`) to respond
- Fully decodes and encodes DNS packets
- Logs incoming DNS queries

---

## Why I Built This

DNS is a critical part of how the internet works, yet it's often abstracted away. By building a DNS server from scratch, I gained:
- Deeper understanding of how DNS resolution works
- How DNS packets are structured and transmitted
- How to work with raw UDP sockets in Node.js
- Real-world appreciation for DNS caching, TTLs, and root server roles

---

## Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/btwkevin/mydns.git
cd custom-dns-server
```

### 2. Install Dependencies

```bash
npm install dns-packet
```

### 3. Run the DNS Server

```bash
node server.js
```

The server will start and listen on **UDP port 8000**.

---

## 🧾 Example Code

```js
import dgram from 'node:dgram';
import dnsPacket from 'dns-packet';

const socket = dgram.createSocket('udp4');

const db = {
  'devkevin.cloud': {
    type: 'A',
    data: '1.2.3.4',
  },
  'blog.devkevin.cloud': {
    type: 'CNAME',
    data: 'btwkevin.me',
  },
};

socket.on('message', (message, rinfo) => {
  const incomingReq = dnsPacket.decode(message);
  console.log({
    questions: incomingReq.questions?.[0]?.name ?? 'No questions',
    rinfo,
  });

  const ipFromDb = db[incomingReq.questions[0].name];
  if (!ipFromDb) return;

  const answer = dnsPacket.encode({
    type: 'response',
    id: incomingReq.id,
    flags: dnsPacket.AUTHORITATIVE_ANSWER,
    questions: incomingReq.questions,
    answers: [
      {
        type: ipFromDb.type,
        class: 'IN',
        name: incomingReq.questions[0].name,
        data: ipFromDb.data,
      },
    ],
  });

  socket.send(answer, rinfo.port, rinfo.address);
});

socket.on('error', (err) => {
  console.error(err.message);
});

socket.bind(8000);
```

---

## ⚠️ Notes

- This is **not production-grade** and does not support recursion, TTLs, or DNSSEC.
- It’s a minimal project to **learn how DNS works under the hood**.
- You can test it using tools like `dig` or `nslookup`.
