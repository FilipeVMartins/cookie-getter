import React, { useState, useEffect, useContext, useReducer, useCallback, useMemo } from 'react';

import { Button, ButtonToolbar, Notification, useToaster } from 'rsuite';

export const PopupComponent = () => {
  const toaster = useToaster();

  const tabReload = async () => {
    await chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      await chrome.tabs.reload(tab.id, () => {
        console.log('Tab reloaded!');
      });
    });
  };

  const getCookies = () => new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      chrome.cookies.getAll({ url: tabs[0].url }, (cookies) => {
        resolve(cookies);
      });
    });
  });


  // Function to set cookies back to the browser
  const setCookies = async (cookies) => {
    await cookies.forEach(async (cookie) => {
      let cookieDetails = {
        url: `http${cookie.secure ? 's' : ''}://${cookie.domain.startsWith('.') ? 'www' : ''}${cookie.domain}${cookie.path}`,
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite
      };

      if (cookie.expirationDate) {
        cookieDetails.expirationDate = cookie.expirationDate;
      }

      await chrome.cookies.set(cookieDetails, (setCookie) => {
        if (chrome.runtime.lastError) {
          console.error(`Failed to set cookie ${cookie.name}: ${chrome.runtime.lastError.message}`);
        }
      });
    });
  };

  const copyLocalData = async () => {

    // get cookies
    const cookies = await getCookies();

    const localData = {
      cookies
    }

    console.log('localData: ', localData);
    
    await navigator.clipboard.writeText(JSON.stringify(localData, null, 2)).then(async () => {
      console.log('Cookies copied to clipboard!');
      await toast('Local cookies data copied to clipboard!', 'success');
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });

  }

  const pasteLocalData = async () => {
    await navigator.clipboard.readText().then(async text => {
      // console.log('Clipboard text read:', text);
      const externalData = JSON.parse(text)
      console.log('Clipboard externalData:', externalData);
      await setCookies(externalData.cookies);
      await toast('External cookies data pasted to local!', 'success');
      await tabReload();
    }).catch(async err => {
      console.error('Failed to read clipboard contents: ', err);
      await toast('Error when pasting external cookies data to local!', 'error');
    });
  }

  const deleteLocalData = async ()  => {
    await chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      await chrome.cookies.getAll({ url: tabs[0].url }, async (cookies) => {
        await cookies.forEach(async (cookie) => {
          await chrome.cookies.remove({
            url: `http${cookie.secure ? 's' : ''}://${cookie.domain.startsWith('.') ? 'www' : ''}${cookie.domain}${cookie.path}`,
            name: cookie.name
          }, (removedCookie) => {
            if (chrome.runtime.lastError) {
              console.error(`Failed to remove cookie ${cookie.name}: ${chrome.runtime.lastError.message}`);
            }
          });
        });

        await toast('Local cookies data deleted!', 'success');
        await tabReload();
      });
    });
  }

  const toast = async (toastMessage = '', toastType = 'info') => {
    await toaster.push(
      <Notification type={toastType} header={`${toastType}!`} closable>
        <p>{toastMessage}</p>
      </Notification>,
      {
        placement: 'topStart',
        duration: 2000,
      }
    )
  };

  return (
    <div className='popup-actions'>
      <ButtonToolbar>
        <Button appearance="primary" onClick={copyLocalData}>Copy Cookies</Button>
        <Button appearance="ghost" onClick={pasteLocalData}>Paste Cookies</Button>
        <Button appearance="ghost" onClick={deleteLocalData} color="red">Delete Cookies</Button>
      </ButtonToolbar>
    </div>
  );
};

export default PopupComponent;