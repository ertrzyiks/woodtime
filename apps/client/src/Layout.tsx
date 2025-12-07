import React, {ReactNode} from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Link,
  BottomNavigation,
  BottomNavigationAction
} from '@material-ui/core';
import PublicIcon from '@mui/icons-material/Public';
import EventIcon from '@mui/icons-material/Event';
import {
  Link as RouterLink,
  useHistory,
  useLocation,
} from 'react-router-dom';

import {useTranslation} from "react-i18next";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    loaderWrapper: {
      alignItems: 'center',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      display: 'flex'
    },
    bottomBar: {
      position: 'fixed',
      bottom: 0,
      width: '100%'
    }
  })
);

function BottomBar({ className }: { className: string }) {
  const { t } = useTranslation()
  const history = useHistory()
  const location = useLocation()

  if (location.pathname !== '/' && location.pathname !== '/virtual-challenges') {
    return null
  }

  return (
    <BottomNavigation
      value={location.pathname === '/' ? 0 : 1}
      onChange={(event, newValue) => {
        if (newValue === 0) {
          history.push('/')
        } else {
          history.push('/virtual-challenges')
        }
      }}
      showLabels
      className={className}
    >
      <BottomNavigationAction label={t('navigation.events')} icon={<EventIcon />} />
      <BottomNavigationAction label={t('navigation.virtual_challenges')} icon={<PublicIcon />} />
    </BottomNavigation>
  )
}

function Layout({ children }: { children: ReactNode }) {
  const classes = useStyles()

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            <Link component={RouterLink} to="/" color="inherit">
              Woodtime
            </Link>
          </Typography>
        </Toolbar>
      </AppBar>

      {children}

      <BottomBar className={classes.bottomBar}/>
    </div>
  );
}

export default Layout;
