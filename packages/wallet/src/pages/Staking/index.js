import React, { useEffect } from 'react'
import Header from './Header'
import Validators from './Validators'
import { fetchIntentions, fetchSenators } from '../../reducers/intentionSlice'
import { useDispatch } from 'react-redux'
import { fetchAssetsInfo } from '../../reducers/assetSlice'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  & > main {
    flex: 1;
  }
`

export default function() {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchSenators())
    dispatch(fetchIntentions())
    dispatch(fetchAssetsInfo())
  }, [dispatch])

  return (
    <Wrapper className="staking">
      <Header />
      <Validators />
    </Wrapper>
  )
}
