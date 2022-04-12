import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Provide,
  Query,
} from '@midwayjs/decorator';
import { CreateApiDoc } from '@midwayjs/swagger';
import { ResultVO } from '../vo/ResultVO';
import { Attestation } from '../entity/Attestation';
import { AttestationService } from '../service/AttestationService';
import { SaveAttestationRequest } from '../request/SaveAttestationRequest';

@Provide()
@Controller('/attestation', { tagName: 'attestation interface', description: 'v1' })
export class AttestationController {
  @Inject()
  attestationService: AttestationService;

  @CreateApiDoc()
    .summary('query attestation')
    .description('query attestation by receiverKeyId or senderKeyId')
    .param('receiverKeyId')
    .param('senderKeyId')
    .respond(200, 'attestation array', 'json', {
      example: {
        code: 200,
        data: [
          {
            ciphertext: '0x8f0a9386b3dcb1d33b13e0935030f1953af7e656e10fda79497afbe9ffc0dc952f3343ac34327378744426d9049c81cfb095e655ae928b862dde06217de4619a5799a988ab3309e17666ef5e792ad29ddf87d1b1ec6c338c1c8f5c96c488bc313d90f91676566381ae7750f4244bf83321089aed321aea4b721e3dc98b3dec3323642171ed3c4e0e0aa7215f582fdabe72075c7840e73335848b87182b2a3526c803df97e1f0dc124c977dfcbabd1ecb446128d8dd8335479ac744d6eb09db68ef5e9435b9be619ac2a48374efd3136b936715096fd5fb2c1433fd78cd6d0287a3f2d643e5343fdd14456edafac453dd94256cf28f791a68df7739e245af19c115a9f719935735e13516ed11a104884e148eab85b0aac76b34372ee9a312bc3d5abba61dc1c5b0259e1e63f118878e6b063531b636a7f22b06205d9c6d9cb234b32adaf4a20dbfd00219fcd18acbcb330e80e49e37ffb0866467001c6f3e88de7122993173735b6c5efb13bd360ed2d664e7d55f996a738e6fca1e1391bf31ed5f2b676437d0f05ac2250966e62909c8ff0ccd5cbee6d317559950fbd6b6b8f2322143aaba35fc30401bc74c4e8e6dc255a8e2c88505b9ebb53c5dc3c455486d08696c6ec219b8b3d754dfc03c01341c1107c10a5624919b0202c4f3f23300ee7c0743b648ff225c61ae06b42d0ae2871bcd00c71335ad52bf0b6745ed49ee9371f85283ae9f68bb08fa355679f0f3c429b98dda80006ce7946dadf1c80d4d0da6f66960938d4374c380253c6cf466a2d8da60ee59db0850860260cfe70b386442e2eafc94d166d764bb2a726f42fddf210f6c0d33bd903c9de8fa5b8d9c8168a9eb795e87baa5b44c466317bc3cd1e857439311197ad1f7cddbbd9ecdaeeba46904e60e2284c25786707b1ab62fbfba22b07eeef1c08321ce6526de474b875decf352bc61123f040217b67c7786f8afcab0b812117f8642b8a263e4ff824e5b2fe57dfd4aa399a4035a42ca1f76b054142f93e1e2b98994bf352f7fe97768dd6c3e9f72698a7c8a2896e462d5492d1ced9b6ace57e5b8c030a2f0777aa4f02a42ffcbbe7692343882cbbdf171cb67cb3e5b7945ae59b506c651bd0deb0a656b24f952dcfcadc5d029e856b572bb029362a82fcecd9f1d9d996f3b8d5d010990f134ff59b662212c312dcc0123141d4ba0c500f7727934ed3c84d8be05b4f38c1926e52e796f8551044c3562ac6d8096e4a296120c44dac31362448cd6a1e8a95f47c204aab4eb271ba1df9fbd350256cfe4e8335fb89452371bf3da13d9c264c469f4b5b47ab1c56754debfe6e19df19aea5ae23fdcf454fbed4a6dde8e826c6143fa15908c3cf1c452d244219072b9711e2e6f2e02244b3d7cc1ae718f4c094d3dd56a36b500b29084eee148e00484574ce99a7656fd5a940a70b67c11f5e719128b924d9368b7a5caad892408394545e32a2eb48ef5dda3d3dfc5a57ffc68d9f1837be504d5d50f5532e398227e58643f8b893fde3d65ea079b34f47625593a6e7a13e7a64301525171474df80fc6d092cd0f3bca3e660a65d8b66c0fc9ea2a15284ff2843b27259bcd7de7cde69acf2eccc5b037054ce17f82c94d329366abcb62a1f377a2608dc152a7b68d9d84082c853c72484bd08908ccd3d3af4e83371fbfcdb12511d1c7d1b2f1e6c9e725376808f2b73b9060f32018c6de06088f4b6be9227b6a669eb3239f78e7370951de8c2498ceaac414b30521e90cc4d8470a1601d9f15bd8c2e2d65ccc38623b10647e7ab01b026571d2cf1374bc6c38a413c0a5afbdcf10ad45f31051ace9a1932a64550fe67f9edaace5e8b8067bca5e6f33dcc815017f8944248a9b301e005c16b342c332ea3d6d94ed2540ee4122d13337c19ef0e82ce9481caada424fdf90cd7dc4b37080e4321a44086b55cdd61443a8b65bea9d9203544a822668eaa33933597ebcd0fb047de27b1de1c6ec4c5f89d3425b7812ca57ca5c4637d4b2006affb6db549cc8b1a8b603d561221b65740d102dcf99652023f9c3b8ee5a03b695d23e2f01d09191f6e12dd3dbc016da5d174a6e8237e462271905f9ab0739cda0ddf649d86ed3756ab39e265499e1fafa436fd3bbfba75401a469ce10a736eeafd971d0b55064ae8cdef8df1b8c049aef5064a40eb22c99fd11bbd2c89770ff14adb78de80410a31127188db8914aefcb2a51a980cd39b503209d57fb7890ee1d169c26ab4437ead46a2caae691898d5ce2fd936a752682305728b5c31d29392e1b46dad7cd92754a24314fa3ad2c360e21c8b33e84537adfe825a0e1b2d92adde912b7fe3c647e121e0654e29e73730bfcd531f4a262616e35f019b0ecc48bd7',
            nonce: '0xa568cc0c486516aa68058e0168d3dc246028bf839da31943',
            senderKeyId: 'did:kilt:4rdUX21mgJYGPpU3PmmjSMDkthg9yD2eFeRXyh84tD6ssvS4#0x30f19b670478c8ab06a660ebf3f430617b3bd5eec592a284a54d56b8169ae380',
            receiverKeyId: 'did:kilt:light:004o9uYN7ZtkXDiEaS63wKoTAsKFPKDebbam4dX9otoCzkghsK:z1Ac9CMtYCTRWjetJfJqJoV7FcP1jPwGjJotcZLADLfdHqTX8PjEo4FPeamUrQTgbR4naUEG2vbzHNQHKP8J6Ac#encryption',
          }
        ]
      }
    })
    .build()
  @Get('/one')
  async getByReceiver(
    @Query('receiverKeyId') receiverKeyId: string,
    @Query('senderKeyId') senderKeyId: string
  ) {
    const data = await this.attestationService.getByReceiverKeyIdAndSenderKeyId(
      receiverKeyId, senderKeyId
    );
    return ResultVO.success(data);
  }

  @CreateApiDoc()
    .summary('add attestation')
    .description('add a new attestation')
    .param('attestation entity')
    .respond(200, 'execute success')
    .build()
  @Post('/add')
  async save(@Body(ALL) attestationReq: SaveAttestationRequest) {
    const attestation = attestationReq as Attestation;
    await this.attestationService.save(attestation);
    return ResultVO.success();
  }
}
