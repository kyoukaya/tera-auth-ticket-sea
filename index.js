'use strict'
const axios = require('axios')

class WebClient {
  constructor (email, pass) {
    this.email = email
    this.pass = pass
    this.http = axios.create({
      baseURL: 'https://teralauncher.playwith.in.th',
      timeout: 5000
    })
    this.http.defaults.headers.common = {
      'User-Agent': 'bh_launcher',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'en-US,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate',
      'X-Requested-With': 'XMLHttpRequest',
      'Connection': 'keep-alive',
      'Referer': 'https://teralauncher.playwith.in.th/Launcher/EN'
    }
  }

  async getLogin (callback) {
    let response, cookie

    response = await this.http.post('Launcher/Login',
      {
        'Frm_id': this.email,
        'Frm_pwd': this.pass
      }
    )

    if (response.status !== 200 || response.data.loginResult !== '0000') {
      console.error('Login failed.')
      return callback(new Error('Login failed.'))
    }

    cookie = response.headers['set-cookie'][0].split(';')[0]

    // Simulate an actual log in by requesting the server list
    // For some reason, this is necessary for the server to issue a cookie that will
    // generate a valid token for logging in with a fake client.
    response = await this.http.post('API/Account/ServerList', null, {
      headers: {
        cookie: cookie
      }
    })

    cookie = response.headers['set-cookie'][0].split(';')[0]

    // Get the ticket
    response = await this.http.post('API/Account/Token', null, {
      headers: {
        cookie: cookie
      }
    })

    if (response.status !== 200 || response.data.account_id === 0) {
      console.error('Invalid ticket.')
      return callback(new Error('Invalid ticket.'))
    }

    console.log(`[web] got ticket (${response.data.loginID}:${response.data.token})`)

    callback(null, {
      name: response.data.loginID,
      ticket: response.data.token
    })
  }
}

module.exports = WebClient
