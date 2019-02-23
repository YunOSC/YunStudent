export async function visit (url, retryCount) {
  return new Promise(async (resolve, reject) => {
    return (async () => {
      let currentUrl = await this.page.url()
      if (currentUrl !== url) {
        await this.page.goto(url)
        const currentUrl = await this.page.url()

        if (currentUrl.includes('https://webapp.yuntech.edu.tw/YunTechSSO/Account/Login')) {
          // Needs login
          await this.ssoLogin(url).then((loginResult) => {
            if (loginResult.fail !== undefined) {
              return resolve({'fail': true, 'reason': loginResult.reason})
            } else {
              return this.ssoVisit(url)
            }
          })
        }
      }
      currentUrl = await this.page.url()
      if (!currentUrl.includes(url)) {
        await this.page.goto(url)
      }
      return resolve({'success': true})
    })().catch((err) => {
      if ((retryCount || 0) <= this.maximumRetryCount) {
        return this.ssoVisit(url, retryCount + 1)
      } else {
        return resolve({'fail': true, 'reason': err})
      }
    })
  })
}
