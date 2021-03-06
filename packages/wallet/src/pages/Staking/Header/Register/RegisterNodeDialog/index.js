import React, { useState } from 'react'
import StyledDialog from './StyledDialog'
import { noneFunc, retry } from '../../../../../utils'
import infoIcon from '../../../../../static/explan.svg'
import { PrimaryButton, TextInput } from '@chainx/ui'
import { CheckBox } from '../../../../../components'
import $t from '../../../../../locale'
import {
  showSnack,
  signAndSendExtrinsic
} from '../../../../../utils/chainxProvider'
import { useDispatch, useSelector } from 'react-redux'
import { addressSelector } from '../../../../../reducers/addressSlice'
import { fetchIntentions } from '../../../../../reducers/intentionSlice'
import { getChainx } from '../../../../../services/chainx'

export default function({ handleClose = noneFunc }) {
  const accountAddress = useSelector(addressSelector)
  const [name, setName] = useState('')
  const [nameErrMsg, setNameErrMsg] = useState('')
  const [checked, setChecked] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const dispatch = useDispatch()

  const chainx = getChainx()

  const register = async () => {
    if (name.length > 12) {
      setNameErrMsg($t('COMMON_TOO_LONG'))
      return
    }

    setDisabled(true)
    try {
      const extrinsic = chainx.stake.register(name.trim())
      const status = await signAndSendExtrinsic(
        accountAddress,
        extrinsic.toHex()
      )
      const messages = {
        successTitle: '注册成功',
        failTitle: '注册失败',
        successMessage: `注册名称 ${name.trim()}`,
        failMessage: `交易hash ${status.txHash}`
      }

      setDisabled(false)
      await showSnack(status, messages, dispatch)
      handleClose()
      retry(
        () => {
          dispatch(fetchIntentions())
        },
        5,
        2
      ).then(() => console.log('Refresh intentions 5 times after create node'))
    } catch (e) {
      setDisabled(false)
    }
  }

  return (
    <StyledDialog
      open
      title={$t('STAKING_REGISTER_INTENTION')}
      handleClose={handleClose}
    >
      <div className="wrapper">
        <p className="info">
          <img src={infoIcon} alt="info" />
          <span>唯一且不可更改，注册后不可转让</span>
        </p>
        <div>
          <TextInput
            value={name}
            onChange={setName}
            placeholder="节点名（12 字符以内）"
            error={!!nameErrMsg}
            errorText={nameErrMsg}
          />
        </div>
        <div>
          <CheckBox checked={checked} onClick={() => setChecked(!checked)}>
            <span className="read">我已阅读</span>
            <a href="https://github.com/chainx-org/ChainX/wiki/Join-ChainX-Mainnet">
              节点部署文档
            </a>
          </CheckBox>
        </div>

        <div>
          <PrimaryButton
            disabled={!checked || disabled}
            size="fullWidth"
            onClick={register}
          >
            {$t('COMMON_CONFIRM')}
          </PrimaryButton>
        </div>
      </div>
    </StyledDialog>
  )
}
