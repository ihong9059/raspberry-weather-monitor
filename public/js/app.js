// API 기본 URL
const API_BASE_URL = window.location.origin;

// 전역 상태
let currentRange = 24; // 현재 선택된 시간 범위 (시간 단위)

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 앱 초기화 시작');

    // 서버 상태 확인
    checkServerHealth();

    // 초기 데이터 로드 (최근 24시간)
    loadData(24);

    // 이벤트 리스너 등록
    setupEventListeners();

    console.log('✅ 앱 초기화 완료');
});

// 서버 상태 확인
async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('server-status').textContent = '서버 정상 동작 중';
            document.getElementById('server-status').classList.remove('offline');
        }
    } catch (error) {
        console.error('서버 상태 확인 실패:', error);
        document.getElementById('server-status').textContent = '서버 연결 실패';
        document.getElementById('server-status').classList.add('offline');
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 빠른 버튼 클릭
    document.querySelectorAll('.quick-buttons .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const hours = parseInt(this.dataset.hours);

            // 활성 버튼 표시
            document.querySelectorAll('.quick-buttons .btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 데이터 로드
            loadData(hours);
        });
    });

    // 사용자 정의 기간 적용
    document.getElementById('apply-custom').addEventListener('click', function() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (!startDate || !endDate) {
            alert('시작 날짜와 종료 날짜를 모두 선택해주세요.');
            return;
        }

        // 활성 버튼 제거
        document.querySelectorAll('.quick-buttons .btn').forEach(b => b.classList.remove('active'));

        // 사용자 정의 기간으로 데이터 로드
        loadDataByRange(startDate, endDate);
    });

    // 새로고침 버튼
    document.getElementById('refresh-btn').addEventListener('click', function() {
        loadData(currentRange);
    });
}

// 시간 범위로 데이터 로드
async function loadData(hours) {
    currentRange = hours;

    const endDate = new Date();
    const startDate = new Date(endDate - hours * 60 * 60 * 1000);

    await loadDataByRange(
        startDate.toISOString(),
        endDate.toISOString()
    );
}

// 날짜 범위로 데이터 로드
async function loadDataByRange(start, end) {
    try {
        console.log(`📊 데이터 로드 중: ${start} ~ ${end}`);

        // 데이터 조회
        const response = await fetch(
            `${API_BASE_URL}/api/weather/data?start=${start}&end=${end}`
        );
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || '데이터 로드 실패');
        }

        console.log(`✅ ${result.count}개의 데이터 로드 완료`);

        // 데이터 처리 및 표시
        if (result.count > 0) {
            updateCharts(result.data);
            updateCurrentStatus();
            updateStatistics(start, end);
        } else {
            alert('선택한 기간에 데이터가 없습니다.');
        }

    } catch (error) {
        console.error('데이터 로드 오류:', error);
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
}

// 차트 업데이트
function updateCharts(data) {
    // 레이블 (시간) 생성
    const labels = data.map(item => {
        const date = new Date(item.timestamp);
        return date.toLocaleString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    });

    // 온도 데이터
    const temperatures = data.map(item => parseFloat(item.temperature));

    // 습도 데이터
    const humidities = data.map(item => parseFloat(item.humidity));

    // 차트 생성/업데이트
    createTemperatureChart(labels, temperatures);
    createHumidityChart(labels, humidities);
}

// 현재 상태 업데이트 (최신 데이터)
async function updateCurrentStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/weather/latest`);
        const result = await response.json();

        if (result.success) {
            const data = result.data;

            // 온도
            document.getElementById('current-temperature').textContent =
                parseFloat(data.temperature).toFixed(1);

            // 습도
            document.getElementById('current-humidity').textContent =
                parseFloat(data.humidity).toFixed(1);

            // 최종 측정 시간
            const timestamp = new Date(data.timestamp);
            document.getElementById('last-update').textContent =
                timestamp.toLocaleString('ko-KR');
        }
    } catch (error) {
        console.error('현재 상태 업데이트 오류:', error);
    }
}

// 통계 정보 업데이트
async function updateStatistics(start, end) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/weather/stats?start=${start}&end=${end}`
        );
        const result = await response.json();

        if (result.success) {
            const stats = result.stats;

            // 온도 통계
            document.getElementById('avg-temperature').textContent =
                stats.avg_temperature ? stats.avg_temperature + '°C' : '--';
            document.getElementById('max-temperature').textContent =
                stats.max_temperature ? stats.max_temperature + '°C' : '--';
            document.getElementById('min-temperature').textContent =
                stats.min_temperature ? stats.min_temperature + '°C' : '--';

            // 습도 통계
            document.getElementById('avg-humidity').textContent =
                stats.avg_humidity ? stats.avg_humidity + '%' : '--';
            document.getElementById('max-humidity').textContent =
                stats.max_humidity ? stats.max_humidity + '%' : '--';
            document.getElementById('min-humidity').textContent =
                stats.min_humidity ? stats.min_humidity + '%' : '--';
        }
    } catch (error) {
        console.error('통계 업데이트 오류:', error);
    }
}

// 자동 새로고침 (5분마다)
setInterval(function() {
    console.log('🔄 자동 새로고침');
    updateCurrentStatus();
    loadData(currentRange);
}, 5 * 60 * 1000); // 5분
