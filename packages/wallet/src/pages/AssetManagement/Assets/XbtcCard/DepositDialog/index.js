import React, { useEffect, useState } from 'react'
import { Dialog } from '@chainx/ui'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { addressSelector } from '../../../../../reducers/addressSlice'
import { u8aToHex } from '@polkadot/util'
import { CheckBox, ClipBoard } from '../../../../../components'
import infoIcon from '../../../../../static/explan.svg'
import {
  fetchTrusteeSessionInfo,
  hotAddressSelector
} from '../../../../../reducers/trustSlice'
import OpReturnWallet from '../../components/OpReturnWallet'
import IntentionSelect from '../../../../../components/IntentionSelect'

const StyledDialog = styled(Dialog)`
  main.content {
    padding: 16px;

    section.show-code {
      margin-top: 12px;
      background: #f2f3f4;
      border: 1px solid #dce0e2;
      border-radius: 6px;
      padding: 14px 12px;

      h3 {
        display: flex;
        justify-content: space-between;
        margin: 0 0 8px;
        opacity: 0.72;
        font-size: 13px;
        color: #000000;
        letter-spacing: 0.2px;
        line-height: 18px;
        span.title {
          font-weight: 500;
        }

        span.addr {
          opacity: 0.32;
          font-size: 13px;
          font-weight: 400;
          color: #000000;
          letter-spacing: 0.2px;
          text-align: right;
          line-height: 18px;
        }

        .channel span {
          opacity: 0.56;
          font-size: 13px;
          color: #000000;
          letter-spacing: 0.2px;
          text-align: right;
          line-height: 18px;
        }
      }

      .hex {
        margin-top: 8px;
        opacity: 0.32;
        font-size: 13px;
        color: #000000;
        letter-spacing: 0.2px;
        line-height: 18px;
      }
    }

    ul.info {
      margin-top: 12px;
      li {
        display: flex;
        align-items: center;
        img {
          width: 16px;
          margin-right: 6px;
        }

        &:not(:first-of-type) {
          margin-top: 6px;
        }

        opacity: 0.56;
        font-size: 12px;
        color: #000000;
        letter-spacing: 0.2px;
        line-height: 16px;
      }
    }
  }

  h1 {
    margin: 0;
    opacity: 0.72;
    font-size: 14px;
    color: #000000;
    letter-spacing: 0.12px;
    line-height: 20px;
    span.step {
      color: #ecb417;
      margin-right: 8px;
    }
    &.step-2 {
      margin-top: 16px;
    }
  }

  p {
    opacity: 0.56;
    font-size: 14px;
    color: #000000;
    letter-spacing: 0.12px;
    line-height: 20px;
    &.op-return,
    &.input {
      margin-top: 8px;
    }
  }
`

export default function({ handleClose }) {
  const [checked, setChecked] = useState(false)
  const address = useSelector(addressSelector)

  const trusteeHotAddress = useSelector(hotAddressSelector)

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchTrusteeSessionInfo())
  }, [dispatch])

  const [channel, setChannel] = useState('')
  const addressHex = u8aToHex(
    new TextEncoder('utf-8').encode(`${address}${channel ? '@' + channel : ''}`)
  ).replace(/^0x/, '')

  return (
    <StyledDialog open title={'跨链充值'} handleClose={handleClose}>
      <main className="content">
        <h1>
          <span className="step">第一步</span>
          <span className="text">获取 OP_RETURN</span>
        </h1>
        <p className={'op-return'}>
          获取含有 16 进制 ChainX 地址的 OP_RETURN 信息。
        </p>
        <section className="show-code">
          <h3>
            <span className="title">OP_RETURN</span>
            <CheckBox
              checked={checked}
              onClick={() => setChecked(!checked)}
              className="channel"
            >
              添加渠道 (选填)
            </CheckBox>
          </h3>
          {checked ? (
            <IntentionSelect
              value={channel}
              onChange={setChannel}
              style={{ marginBottom: 8 }}
            />
          ) : null}
          <ClipBoard className="hex">{addressHex}</ClipBoard>
        </section>
        <h1 className="step-2">
          <span className="step">第二步</span>
          <span className="text">发起跨链提现</span>
        </h1>
        <p className="input">
          使用支持 OP_RETURN 的钱包向信托热多签地址充值，并输入 OP_RETURN 信息。
        </p>
        <ul className={'info'}>
          <li>
            <img src={infoIcon} alt="info" />
            <span>充值金额必须 >=0.001 BTC；</span>
          </li>
          <li>
            <img src={infoIcon} alt="info" />
            <span>目前仅支持 1 和 3 开头的 BTC 地址发起的跨链充值；</span>
          </li>
          <li>
            <img src={infoIcon} alt="info" />
            <span>类似 imToken 钱包的 memo 不是 OP_RETURN。</span>
          </li>
        </ul>
        <section className="show-code">
          <h3 style={{ marginBottom: 0 }}>
            <span className="title">信托热多签地址</span>
            <ClipBoard className={'addr'}>{trusteeHotAddress}</ClipBoard>
          </h3>
        </section>
        <OpReturnWallet />
      </main>
    </StyledDialog>
  )
}
