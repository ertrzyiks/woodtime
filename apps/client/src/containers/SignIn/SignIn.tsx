import React from 'react'
import { Field, Form } from 'react-final-form'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import {useMutation} from "@apollo/client";
import {SignInDocument} from "./data/signIn";
import {Box} from "@material-ui/core";
import {useHistory} from "react-router-dom";

interface Values {
  name: string
}

const SignIn = () => {
  const history = useHistory()

  const [signIn] = useMutation(SignInDocument, {
    onCompleted: () => {
      const urlParams = new URLSearchParams(history.location.search)

      const redirect = urlParams.get('redirect_url')
      if (redirect) {
        window.location.href = decodeURIComponent(redirect)
      } else {
        history.push('/')
      }
    }
  })

  const handleSubmit = (values: Values) => {
    return signIn({
      variables: values
    })
  }

  return (
    <Box px={2} py={1}>
      <Form<Values>
        onSubmit={handleSubmit}
        render={({ handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit}>
              <h2>Sign In</h2>
              <Field
                name="name"
                render={({ input, meta }) => (
                  <Box my={1}>
                    <TextField
                      id="standard-basic"
                      label="Name"
                      required
                      autoComplete="off"
                      onChange={input.onChange}
                    />
                    {meta.touched && meta.error && <span>{meta.error}</span>}
                  </Box>
                )}
              />
              <Button variant="contained" color="primary" type="submit">
                Create
              </Button>
            </form>
          )
        }}
      />
    </Box>
  )
}

export default SignIn
