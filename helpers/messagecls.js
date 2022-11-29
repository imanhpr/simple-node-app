class Message {
    constructor(color, msg) {
        this.color = color;
        this.msg = msg;
    }
}
class MessageList {
    constructor() {
        this.msgList = []
    }
    get anyMessage() {
        return this.msgList.length >= 1
    }
    appendMessage(color, msg) {
        const msg_obj = new Message(color, msg);
        this.msgList.push(msg_obj);
        return msg_obj
    }
    get list() {
        return this.msgList
    }

    static createMessage(color, msg) {
        return new Message(color, msg)
    }
}

function messageFromErrorList(errorsArry, color = 'red') {
    if (errorsArry.length < 1 ) return null
    const messageList = new MessageList()
    for (errorObj of errorsArry) {
        messageList.appendMessage(color, errorObj.msg)
    }
    return messageList;
}
function fromRawList(lst) {
    if (lst.length < 1 ) return null
    const messageList = new MessageList()
    for (message of lst) {
        messageList.appendMessage(message.color , message.msg)
    }
    return messageList
}
module.exports = {
    MessageList : MessageList,
    messageFromErrorList : messageFromErrorList,
    fromRawList : fromRawList
};