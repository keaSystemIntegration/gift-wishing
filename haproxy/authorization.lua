--
-- JWT Validation implementation for HAProxy Lua host
--
-- Copyright (c) 2019. Adis Nezirovic <anezirovic@haproxy.com>
-- Copyright (c) 2019. Baptiste Assmann <bassmann@haproxy.com>
-- Copyright (c) 2019. Nick Ramirez <nramirez@haproxy.com>
-- Copyright (c) 2019. HAProxy Technologies LLC
--
-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
--
--    http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.
--
-- Use HAProxy 'lua-load' to load optional configuration file which
-- should contain config table.
-- Default/fallback config
if not config then
  config = {
      hmacSecret = nil
  }
end

-- search these paths for *.lua
package.path = package.path .. ';/usr/local/share/lua/5.3/?.lua'

local json   = require 'json'
local base64 = require 'base64'
local openssl = {
  hmac = require 'openssl.hmac'
}

local function log(msg)
  if config.debug then
      core.Debug(tostring(msg))
  end
end

local function decodeJwt(txn, authorizationHeader)
  local headerFields = core.tokenize(authorizationHeader, " .")

  if #headerFields ~= 4 then
      txn:Alert("Improperly formated Authorization header. Should be 'Bearer' followed by 3 token sections.")
      return nil
  end

  if headerFields[1] ~= 'Bearer' then
      txn:Alert("Improperly formated Authorization header. Missing 'Bearer' property.")
      return nil
  end

  local token = {}
  token.header = headerFields[2]
  token.headerdecoded = json.decode(base64.decode(token.header))

  token.payload = headerFields[3]

  token.payloaddecoded = json.decode(base64.decode(token.payload))
  
  txn:Alert("PAYLOAD")
  txn:Alert(token.payloaddecoded.email)
  

  token.signature = headerFields[4]
  token.signaturedecoded = base64.decode(token.signature)
  return token
end

local function algorithmIsValid(token)
  if token.headerdecoded.alg == nil then
      log("No 'alg' provided in JWT header.")
      return false
  elseif token.headerdecoded.alg ~= 'HS256' and  token.headerdecoded.alg ~= 'HS512' and token.headerdecoded.alg ~= 'RS256' then
      log("HS256, HS512 and RS256 supported. Incorrect alg in JWT: " .. token.headerdecoded.alg)
      return false
  end

  return true
end

local function hs256SignatureIsValid(token, secret)
  local hmac = openssl.hmac.new(secret, 'SHA256')
  local checksum = hmac:final(token.header .. '.' .. token.payload)
  return checksum == token.signaturedecoded
end

local function hs512SignatureIsValid(token, secret)
  local hmac = openssl.hmac.new(secret, 'SHA512')
  local checksum = hmac:final(token.header .. '.' .. token.payload)
  return checksum == token.signaturedecoded
end

local function setVariablesFromPayload(txn, decodedPayload)
  local jsonPayload = json.encode(decodedPayload)
  txn.set_var(txn, "txn.user", jsonPayload)
end

local function authorize(txn)
  local hmacSecret = config.hmacSecret

  -- 1. Decode and parse the JWT
  local token = decodeJwt(txn, txn.sf:req_hdr("Authorization"))

  if token == nil then
    log("Token could not be decoded.")
    goto out
  end

  -- Set an HAProxy variable for each field in the token payload
  setVariablesFromPayload(txn, token.payloaddecoded)

  -- 2. Verify the signature algorithm is supported (HS256, HS512, RS256)
  if algorithmIsValid(token) == false then
      log("Algorithm not valid.")
      goto out
  end

  -- 3. Verify the signature with the certificate
  if token.headerdecoded.alg == 'HS256' then
    if hs256SignatureIsValid(token, hmacSecret) == false then
      log("Signature not valid.")
      goto out
    end
  elseif token.headerdecoded.alg == 'HS512' then
    if hs512SignatureIsValid(token, hmacSecret) == false then
      log("Signature not valid.")
      goto out
    end
  end

  -- 4. Set authorized variable
  log("req.authorized = true")
  txn.set_var(txn, "txn.authorized", true)

  -- exit
  do return end

  -- way out. Display a message when running in debug mode
::out::
 log("req.authorized = false")
 txn.set_var(txn, "txn.authorized", false)
end

-- Called after the configuration is parsed.
core.register_init(function()  
  -- when using an HS256 or HS512 signature
  config.hmacSecret = os.getenv("JWT_SECRET")
end)

-- Called on a request.
core.register_action('authorize', {'http-req'}, authorize, 0)