/**
 * result vo.
 */
export class ResultVO {
  private static CODE_SUCCESS = 200

  private static CODE_ERROR = 500

  code: number;

  data: any;

  message: string;

  static success(data?: any, message?: string) {
    const resultVO = new ResultVO();
    resultVO.code = ResultVO.CODE_SUCCESS;
    resultVO.data = data;
    resultVO.message = message;
    return resultVO;
  }

  static error(message: string) {
    const resultVO = new ResultVO();
    resultVO.code = ResultVO.CODE_ERROR;
    resultVO.message = message;
    return resultVO;
  }
}
