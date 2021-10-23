import React from 'react'
import { Field, Form } from 'react-final-form'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import {useMutation, useQuery} from "@apollo/client";
import {SignInDocument} from "../../queries/signIn";
import {MeDocument} from "../../queries/me";

interface Values {
  name: string
}

const SignIn = () => {
  const { data } = useQuery(MeDocument, {
    fetchPolicy: 'network-only'
  })
  const [signIn] = useMutation(SignInDocument)

  const handleSubmit = (values: Values) => {
    return signIn({
      variables: values
    })
  }

  return (
    <Form<Values>
      onSubmit={handleSubmit}
      render={({ handleSubmit }) => {
        return (
          <form onSubmit={handleSubmit}>
            <div>
              Session: {data?.me?.name}
            </div>
            <Field
              name="name"
              render={({ input, meta }) => (
                <div>
                  <TextField
                    id="standard-basic"
                    label="Name"
                    required
                    autoComplete="off"
                    onChange={input.onChange}
                  />
                  {meta.touched && meta.error && <span>{meta.error}</span>}
                </div>
              )}
            />
            <Button variant="contained" color="primary" type="submit">
              Create
            </Button>
          </form>
        )
      }}
    />
  )
}

export default SignIn
