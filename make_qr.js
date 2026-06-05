/**
 * @fileoverview 연락처(vCard) 데이터를 기반으로 중복 없는 QR코드 이미지를 생성하는 스크립트
 * @project QR_Generator
 * @date 2026-06-05
 * @lastModified 2026-06-05
 * @author dev-hyewon
 * @version 1.1.0
 */

import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 현재 디렉터리 경로(__dirname)를 구하기 위한 초기화
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//QR코드가 저장될 전용 폴더명 설정 상수
const OUTPUT_DIR_NAME = 'output_qrs';

//QR코드 패턴(전경) 색상 (Hex Color Code)
const QR_COLOR_DARK = '#000000';

//QR코드 배경 색상 (Hex Color Code)
const QR_COLOR_LIGHT = '#FFFFFF';

//QR코드로 변환할 vCard 3.0 규격의 연락처 원본 데이터(임시)
const vCardData = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:홍;길동;;;',
    'FN:홍길동',
    'ORG:테크 컴퍼니',
    'TEL;TYPE=CELL:010-1234-5678',
    'EMAIL:hong@example.com',
    'END:VCARD'
].join('\n');

/**
 * vCard 문자열에서 전체 이름(FN, Full Name) 필드의 값을 추출합니다.
 * @param {string} vCard - 분석할 vCard 형식의 전체 문자열
 * @returns {string} 추출된 이름 문자열 (FN 필드가 없을 경우 기본값 '연락처' 반환)
 */
function extractNameFromVCard(vCard) {
    const lines = vCard.split('\n');
    
    for (let line of lines) {
        if (line.startsWith('FN:')) {
            return line.replace('FN:', '').trim();
        }
    }
    
    return '연락처';
}

/**
 * 대상 디렉터리 내에 동일한 파일명이 존재할 경우, 
 * 파일명 뒤에 숫자 넘버링(예: 파일명(1).png)을 붙여 고유한 파일 경로를 생성합니다.
 * @param {string} dir - 파일이 저장될 대상 디렉터리 경로
 * @param {string} baseName - 확장자를 제외한 기본 파일명 (예: '홍길동 QR 코드')
 * @param {string} extension - 점(.)을 제외한 파일 확장자 (예: 'png')
 * @returns {string} 중복 검사가 완료된 최종 절대 파일 경로
 */
function getUniqueFilePath(dir, baseName, extension) {
    let fileName = `${baseName}.${extension}`;
    let filePath = path.join(dir, fileName);
    let counter = 1;

    // 파일이 이미 존재한다면 빈 이름이 나올 때까지 넘버링 증가 회전
    while (fs.existsSync(filePath)) {
        fileName = `${baseName}(${counter}).${extension}`;
        filePath = path.join(dir, fileName);
        counter++;
    }

    return filePath;
}

/**
 * 메인 실행 함수로, 연락처 추출, 폴더 검사, 파일명 중복 처리 과정을 거쳐 
 * 최종적인 연락처 추가용 QR코드 이미지를 파일로 저장합니다.
 * @returns {void}
 */
function generateContactQR() {
    // 단계 1: 출력 전용 폴더 설정 및 자동 생성
    const outputDir = path.join(__dirname, OUTPUT_DIR_NAME);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // 단계 2: 데이터 가공 및 중복 없는 파일명 확보
    const name = extractNameFromVCard(vCardData);
    const baseFileName = `${name} QR 코드`;
    const finalOutputPath = getUniqueFilePath(outputDir, baseFileName, 'png');

    // 단계 3: QR코드 생성 옵션 정의 (오류 복구율 최대화 및 색상 지정)
    const options = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 4,
        color: {
            dark: QR_COLOR_DARK,  // 패턴 색상 (검은색)
            light: QR_COLOR_LIGHT // 배경 색상 (흰색)
        }
    };

    // 단계 4: QR코드 파일 생성 프로세스 실행
    QRCode.toFile(finalOutputPath, vCardData, options, function (err) {
        if (err) {
            console.error('⚠️ QR코드 생성 중 오류가 발생했습니다:', err);
            return;
        }
        
        console.log('--------------------------------------------------');
        console.log('✅ 연락처 QR코드가 안전하게 생성되었습니다!');
        console.log(`📂 저장 완료: ${finalOutputPath}`);
        console.log('--------------------------------------------------');
    });
}

// 스크립트 실행
generateContactQR();