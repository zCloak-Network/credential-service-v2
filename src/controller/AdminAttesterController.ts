import { ALL, Body, Controller, Post, Provide } from '@midwayjs/decorator';
import { CreateApiDoc } from '@midwayjs/swagger';
import { ResultVO } from '../vo/ResultVO';
import { SubmitClaimRequest } from '../request/SubmitClaimRequest';

@Provide()
@Controller('/admin-attester', {
  tagName: 'admin attester interface',
  description: 'v1',
})
export class AdminAttesterController {
  @CreateApiDoc()
    .summary('submit for get credential')
    .description(
      'submit user input claim, generate credential by system admin attester'
    )
    .param('user entered claim entity')
    .respond(200, 'system generated credential', 'json', {
      example: {
        code: 200,
        data: {
          _id: '6246b73d81e3290e3b4761dc',
          ciphertext:
            '0xab325828c74748fb293611890e069250fc7d880497f95761a7c1597cdd1dca4a1b096af2bc5de7f0d76d8c2fedbce835253873e27f62c7bfd4fc97431b0a7e7e3d7f3e54f16c7b80da05e724f79e16fc883c9cb8c23284a6a993c6e62554a2364ca2bd6d8f8ce3b377b5317e8247717c5f352f769a971d8a1a1ef7ddfafca8796ac3db4637b19b3d5b7fbe10b49d04306f91f82784a58933ea24c47009351a5b1488c82ea76d225c82b8631ed862b07e2fb2accb7f39397095e8e70b325c55ae2545001585c14f4d4bf5bda3466656ffb52b60742e99903d18282e14e890e13b5bbf993127523ffc747e3b4f999a494249f76edb51b94f567df08a4644779d3febea32c760736509e12b6ca89bae793eb1b9e8e502b4881aa11709c8a45aef8c99b9848c82fcdcac598035371a22d3d145ca178a0bf4cd2aaca9fc63e008e5261df0978c580bb66f98a675c79d804bb834939a80f9434f26c8477f5c65393c660a5937a7a28607e780ffd2b096d2e036d81d31933e1a46adff997c0b7ca52b3599041de2a9469b779a6a4728de5174f274e18bdb38d2739599602a8992776130607730cd420c7cc9c9c81acf3f0b04ec1e551a8c7df875b8e6ba44804788ecac3dab104f76e5f28a131b840648e50a45261cf8669c1548378710300624028f60eb9930aa8ade95470a4e00aaedfa815fe39fccf6588c9799bc2601a74a981f5a00bb2f540b695b05a7e89308d2d288004c0e3c43b17a14cc34bf6d64e7ee01d6939d216ef94b8bee8fabfe27e538d4d780479127f4265422e76bfa97f29865cd745cd0e50814d2d39b7866323f45e6e77daeceb24548be7daa6797e018ed2332885ca7d6a290310364a908179bae772d853ef12deef9267369cc53e210adc7076b7d50446fd831408d66e9c102aeb2991dec7e940a3eb15118c107575817ac4f5058b3f3164188368a7c95d07e9e6bcdb68103',
          nonce: '0x4b78de0947ff8b0ced1597dd1b35f08ebcf3270982f2589a',
          senderKeyId:
            'did:kilt:4qsgQujE9bas6RHg9roydCzrKHp1nYefB6pyW8vCE9LnnDSp#0xffb55859bd5d3fa9907b53e07b6d5a3013422b5ca1822c45fb7d6a7d017e9c21',
          receiverKeyId:
            'did:kilt:light:004oNZkWo2iiUtUdQsWR6z43h3dDiCjHnD2hLrWYHfzb5wSM7a:z1Ac9CMtYCTRWjetJfJqJoV7FcNGKaFKEewSNU2zbXmszcX1rdwJQENUoWEWCKBnnR4HSPP7ZP1dgdM1qATpWxQ#encryption',
          __v: 0,
        },
      },
    })
    .build()
  @Post('/submit-claim')
  async submitClaim(@Body(ALL) submitClaimRequest: SubmitClaimRequest) {
    return ResultVO.success();
  }
}
