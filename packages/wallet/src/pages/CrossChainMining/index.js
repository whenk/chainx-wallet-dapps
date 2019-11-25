import React, { useEffect } from 'react'
import Xbtc from './XbtcCard'
import Lbtc from './LbtcCard'
import Sdot from './SdotCard'
import Power from './Power'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchPseduIntentions,
  fetchPseduNominationRecords
} from '../../reducers/intentionSlice'
import { fetchAssetsInfo } from '../../reducers/assetSlice'
import { addressSelector } from '../../reducers/addressSlice'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  & > section:not(:first-of-type) {
    margin-top: 16px;
  }
`
const Contained = styled.div`
  display: flex;
`

export default function() {
  const address = useSelector(addressSelector)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchPseduIntentions())
    dispatch(fetchAssetsInfo())
    dispatch(fetchPseduNominationRecords(address))
  }, [dispatch, address])

  return (
    <Contained>
      <Wrapper>
        <Xbtc />
        <Lbtc />
        <Sdot />
      </Wrapper>
      <Power />
    </Contained>
  )
}
