import dgram from 'node:dgram'
import dnsPacket from 'dns-packet'

const socket = dgram.createSocket('udp4')  

const db = {
    "devkevin.cloud": {
        type: 'A',           
        data: '1.2.3.4'      
    },
    "blog.devkevin.cloud": {
        type: 'CNAME',
        data: 'btwkevin.me'
    }
}

socket.on('message', (message, rinfo) => { 
    try {
        const incomingReq = dnsPacket.decode(message)
        console.log({
            questions: incomingReq.questions?.[0]?.name ?? 'No questions',
            rinfo: rinfo
        });

        const questionName = incomingReq.questions?.[0]?.name
        const ipFromDb = db[questionName]

        if (!ipFromDb) {
            console.log(`No record found for ${questionName}`)
            return
        }

        const answer = dnsPacket.encode({
            type: 'response',  
            id: incomingReq.id,
            flags: dnsPacket.AUTHORITATIVE_ANSWER,
            questions: incomingReq.questions,
            answers: [{
                type: ipFromDb.type,
                class: 'IN',       
                name: questionName,
                data: ipFromDb.data
            }]
        })

        socket.send(answer, rinfo.port, rinfo.address)
    } catch (err) {
        console.error('Failed to handle DNS request:', err)
    }
})

socket.on('error', (err) => {  
    console.log(err.message)
})

socket.bind(8000, () => {
    console.log('DNS server listening on port 8000')
})
