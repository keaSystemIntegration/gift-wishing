local function log(msg)
    core.Debug(tostring(msg))
end


package.path = package.path .. ';/usr/local/etc/haproxy/?.lua'

-- local json   = require 'json'
-- local base64 = require 'basexx'

local function decodeJwt(txn)
  local authorizationHeader = txn.get_var(txn, "txn.authorization")
  local headerFields = core.tokenize(authorizationHeader, " .")

  if #headerFields ~= 4 then
      log("Improperly formated Authorization header. Should be 'Bearer' followed by 3 token sections.")
      return nil
  end

  if headerFields[1] ~= 'Bearer' then
      log("Improperly formated Authorization header. Missing 'Bearer' property.")
      return nil
  end

  local token = {}
  token.header = headerFields[2]
  txn:Alert(token.header)
  txn:Alert(base64.decode(txn, token.header))
  token.headerdecoded = json.decode(base64.decode(token.header))

  token.payload = headerFields[3]
  token.payloaddecoded = json.decode(base64.decode(token.payload))

  token.signature = headerFields[4]
  token.signaturedecoded = base64.decode(token.signature)

  log('Decoded JWT header: ' .. dump(token.headerdecoded))
  log('Decoded JWT payload: ' .. dump(token.payloaddecoded))

  -- txn:Alert(token)
  return token
end


local function authorize(txn)  
  local token = txn.get_var(txn, "txn.authorization")
  local headerFields = core.tokenize(token, " .")

  if #headerFields ~= 4 then
      log("Improperly formated Authorization header. Should be 'Bearer' followed by 3 token sections.")
      txn.set_var(txn, "txn.authorized", false)
      txn:Alert(txn.authorized)
      return nil
  end

  if headerFields[1] ~= 'Bearer' then
      log("Improperly formated Authorization header. Missing 'Bearer' property.")
      txn.set_var(txn, "txn.authorized", false)
      txn:Alert(txn.authorized)
      return nil
  end
  
  txn.set_var(txn, "txn.authorized", true)
  txn:Alert(txn.authorized)

  return token
end

core.register_action('authorize', {'http-req'}, authorize)

core.register_action('decodeJwt', {'http-req'}, decodeJwt)