import React, { useCallback, useEffect, useState } from 'react'
import useSwr from 'swr'
import App, { AppContext } from 'next/app'

import theme from 'src/theme'
import { ThemeProvider, BaseStyles } from 'theme-ui'

import LibrariesProvider from 'src/models/libraries/context'
import { SliceHandler } from 'src/models/slice/context'
import ConfigProvider from 'src/config-context'

import Drawer from 'rc-drawer'

import LoadingPage from 'components/LoadingPage'
import ConfigErrors from 'components/ConfigErrors'
import NavBar from 'components/NavBar/WithRouter'
import Warnings from 'components/Warnings'

import { FetchError, NoLibraryConfigured } from 'components/UnrecoverableErrors'

import 'react-tabs/style/react-tabs.css'
import 'rc-drawer/assets/index.css'
import 'lib/builder/layout/Drawer/index.css'
import 'react-datepicker/dist/react-datepicker.css'
import 'src/css/modal.css'

import { ServerState } from '../lib/models/server/ServerState'
import ServerError from '../lib/models/server/ServerError'
import { Library } from '../lib/models/common/Library'
import Environment from 'lib/models/common/Environment'
import { Slice } from 'lib/models/common/Slice'
import { AsObject } from 'lib/models/common/Variation'

async function fetcher(url: string): Promise<any> {
  return fetch(url).then((res) => res.json())
}

function countSlices(libraries: ReadonlyArray<Library>): number {
  return libraries.reduce((acc, lib) => acc + lib.components.length, 0)
}

const RenderStates = {
  Loading: () => <LoadingPage />,
  Default: ({ Component, pageProps, ...rest }: { Component: (props: any) => JSX.Element, pageProps: any, rest: any }) => <Component {...pageProps} {...rest} />,
  FetchError,
  LibError: FetchError,
  NoLibraryConfigured,
  ConfigError: ({ configErrors }: { configErrors: { errors?: {[errorKey: string]: ServerError} }}) => <ConfigErrors errors={configErrors} />
}

function MyApp({ Component, pageProps }: { Component: (props: any) => JSX.Element, pageProps: any }) {
  const { data }: { data?: ServerState } = useSwr('/api/state', fetcher)
  console.log(data)
  const [sliceCount, setSliceCount] = useState<number | null>(null)
  const [drawerState, setDrawerState] = useState<{ open: boolean, priority?: any}>({ open: false })
  const [state, setRenderer] = useState<{
    Renderer: (props: any) => JSX.Element,
    payload: { libraries?: ReadonlyArray<Library>, env: Environment, remoteSlices?: ReadonlyArray<Slice<AsObject>> } | null
  }>({ Renderer: RenderStates.Loading, payload: null })

  const openPanel = useCallback(
    (priority?: any) => setDrawerState({ ...drawerState, open: true, ...priority ? { priority } : null }),
    []
  )

  useEffect(() => {
    if (!data) {
      return
    }
    else if (!data.libraries) {
      setRenderer({ Renderer: RenderStates.LibError, payload: data })
    }
    else if (!data.libraries.length) {
      setRenderer({ Renderer: RenderStates.NoLibraryConfigured, payload: { env: data.env } })
    }
    else {
      const newSliceCount = countSlices(data.libraries)
      if (sliceCount !== null && newSliceCount !== sliceCount) {
        return location.reload()
      }
      setSliceCount(newSliceCount)
      setRenderer({ Renderer: RenderStates.Default, payload: data })
      const { env, configErrors, warnings } = data
      console.log('------ SliceMachine log ------')
      console.log('Loaded libraries: ', { libraries: data.libraries })
      console.log('Loaded env: ', { env, configErrors })
      console.log('Warnings: ', { warnings })
      console.log('------ End of log ------')
    }
  }, [data])

  const { Renderer, payload } = state

  return (
    <ThemeProvider theme={theme}>
      <BaseStyles>
        {
          !data ? <Renderer {...payload }/> : (
            <ConfigProvider value={data}>
              {
                !payload || !payload.libraries
                  ? <Renderer Component={Component} pageProps={pageProps} {...payload} openPanel={openPanel} />
                  : (
                      <LibrariesProvider remoteSlices={payload.remoteSlices} libraries={payload.libraries} env={payload.env}>
                        <SliceHandler {...payload}>
                          <NavBar
                            env={data.env}
                            warnings={data.warnings}
                            openPanel={() => openPanel()}
                          />
                          <Renderer Component={Component} pageProps={pageProps} {...payload} openPanel={openPanel} />
                          <Drawer
                            placement="right"
                            open={drawerState.open}
                            onClose={() => setDrawerState({ ...drawerState, open: false })}
                          >
                            <Warnings
                              priority={drawerState.priority}
                              list={data.warnings}
                              configErrors={data.configErrors}
                            />
                          </Drawer>
                        </SliceHandler>
                      </LibrariesProvider>
                  )
              }
            </ConfigProvider>
          )
        }
      </BaseStyles>
    </ThemeProvider>
  )
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  return await App.getInitialProps(appContext)
}

export default MyApp