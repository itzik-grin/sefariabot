global.COLLECTIONS = {
    CUSTOMERS: 'customers',
    INTEGRATIONS: 'integrations',
    WEBHOOKS: 'webhooks',
    MESSAGES: 'messages',
    APPS: 'apps'
}
global.VERIFICATION_STATUS = {
    SUCCEEDED: 'succeeded',
    FAILED: 'failed',
    PENDING: 'pending'
}
global.INTEGRATIONS_SUPPORTED = ["messenger", "line", "viber", "telegram", "line", "wechat", "kik","twilio","mailgun"];
global.INTEGRATION_FIELDS = {
    MESSENGER: ['type', 'app_id', 'app_secret', 'page_id', 'page_access_token'],
    WECHAT: ['type', 'app_id', 'app_secret'],
    VIBER: ['type', 'auth_token'],
    LINE: ['type', 'bot_id', 'access_token'],
    TELEGRAM: ['type', 'access_bot_id'],
    TWILIO: ['type','account_sid', 'auth_token','twilio_number'],
    MAILGUN: ['type','api_key', 'domain'],
    KIK: ['user_name','api_key','type']
}
global.MESSAGE_FIELDS = {TEXT: ['content'], IMAGE: ['content'],VIDEO: ['content'],AUDIO: ['content'],FILE:['content'],LOCATION:['location'],"TEMPLATE":[],Email:["from","content","subject"]};
global.errObj = function (msg, code) {
    return {
        "status": false,
        "error": {
            "message": msg,
            "type": "Messages",
            "code": code
        }
    }
}
global.errMediaObj = function (msg, code) {
    return {
        "status": false,
        "error": {
            "message": msg,
            "type": "Media",
            "code": code
        }
    }
}

global.FILE_SUPPORTED = {
    IMAGES: ['image/png', 'image/jpg', 'image/jpeg'],
    VIDEOS:['video/mp4']




}