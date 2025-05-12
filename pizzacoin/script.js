// 等待DOM加载完成
document.addEventListener("DOMContentLoaded", () => {
    // 绑定开始故事按钮事件
    const startButton = document.querySelector('.opening-scene .pixel-button');
    if (startButton) {
        startButton.addEventListener('click', startStory);
    }

    // 绑定所有章节按钮的点击事件
    document.querySelectorAll('.chapter .pixel-button').forEach(button => {
        button.addEventListener('click', function() {
            const currentChapter = this.closest('.chapter');
            const currentChapterNumber = parseInt(currentChapter.id.replace('chapter', ''));
            const totalChapters = document.querySelectorAll('.chapter').length;
            
            if (currentChapterNumber === totalChapters) {
                // 最后一章，连接钱包
                connectWallet();
            } else {
                // 显示下一章
                showNextChapter(currentChapterNumber + 1);
            }
        });
    });

    // 物理移动披萨
    const pizza = document.querySelector('#physics-pizza');
    if (!pizza) {
        console.error('找不到物理移动披萨元素');
        return;
    }

    // 物理参数
    let posX = Math.random() * (window.innerWidth - 100);
    let posY = Math.random() * (window.innerHeight - 100);
    let speedX = 2;
    let speedY = 2;

    function updatePizzaPosition() {
        // 更新位置
        posX += speedX;
        posY += speedY;

        // 碰撞检测
        if (posX <= 0 || posX >= window.innerWidth - 100) {
            speedX = -speedX;
        }
        if (posY <= 0 || posY >= window.innerHeight - 100) {
            speedY = -speedY;
        }

        // 应用位置
        pizza.style.transform = `translate(${posX}px, ${posY}px) rotate(${posX * 0.1}deg)`;
        requestAnimationFrame(updatePizzaPosition);
    }

    // 启动披萨动画
    updatePizzaPosition();

    // 窗口大小改变时重置披萨位置
    window.addEventListener('resize', () => {
        if (posX > window.innerWidth - 100) posX = window.innerWidth - 100;
        if (posY > window.innerHeight - 100) posY = window.innerHeight - 100;
    });

    // 倒计时功能
    function updateCountdown() {
        const pizzaDay = new Date('May 22, 2024 00:00:00').getTime();
        const now = new Date().getTime();
        const distance = pizzaDay - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

            if (distance < 0) {
                timerElement.innerHTML = "PIZZA DAY IS HERE!";
            }
        }
    }

    // 每秒更新倒计时
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // 故事控制
    function startStory() {
        console.log('开始故事'); // 调试日志
        const openingScene = document.querySelector('.opening-scene');
        const storyChapters = document.querySelector('.story-chapters');
        
        if (!openingScene || !storyChapters) {
            console.error('找不到必要的DOM元素');
            return;
        }
        
        // 淡出开场动画
        openingScene.style.opacity = '0';
        openingScene.style.transition = 'opacity 0.5s ease-out';
        
        setTimeout(() => {
            openingScene.style.display = 'none';
            storyChapters.style.display = 'block';
            showNextChapter(1);
        }, 500);
    }

    function showNextChapter(chapterNumber) {
        console.log('显示章节:', chapterNumber); // 调试日志
        // 获取所有章节
        const chapters = document.querySelectorAll('.chapter');
        const currentChapter = document.getElementById(`chapter${chapterNumber}`);
        
        if (!currentChapter) {
            console.error('找不到章节:', chapterNumber);
            return;
        }
        
        // 隐藏所有章节
        chapters.forEach(chapter => {
            chapter.style.display = 'none';
            chapter.classList.remove('active');
        });
        
        // 显示新章节
        currentChapter.style.display = 'block';
        
        // 触发重排以启动动画
        void currentChapter.offsetWidth;
        
        // 添加active类来触发动画
        currentChapter.classList.add('active');
        
        // 更新按钮状态
        updateNavigationButtons(chapterNumber);
    }

    function updateNavigationButtons(currentChapter) {
        const totalChapters = document.querySelectorAll('.chapter').length;
        
        // 更新"继续"按钮文本
        const continueButton = document.querySelector(`#chapter${currentChapter} .pixel-button`);
        if (continueButton) {
            continueButton.textContent = currentChapter === totalChapters ? 'Join The Revolution' : 'Continue';
        }
    }

    // 按钮悬停效果
    document.querySelectorAll(".pixel-button").forEach(button => {
        button.addEventListener("mouseover", () => {
            button.style.background = "var(--primary-color)";
            button.style.color = "var(--background-color)";
        });
        
        button.addEventListener("mouseout", () => {
            button.style.background = "var(--background-color)";
            button.style.color = "var(--text-color)";
        });
    });

    // 像素文字效果
    document.querySelectorAll(".pixel-text").forEach(text => {
        text.addEventListener("mouseover", () => {
            text.style.textShadow = "4px 4px 0 var(--primary-color)";
        });
        
        text.addEventListener("mouseout", () => {
            text.style.textShadow = "4px 4px 0 rgba(0, 0, 0, 0.5)";
        });
    });

    // 移动端导航菜单
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // 在移动端点击时切换下拉菜单
    if (window.innerWidth <= 768) {
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            });
        });
    }

    // 简单的淡入效果
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll(".feature-card").forEach(card => {
        card.style.opacity = "0";
        card.style.transition = "opacity 0.5s ease";
        observer.observe(card);
    });

    // 按钮悬停效果
    document.querySelectorAll('.pixel-button').forEach(button => {
        button.addEventListener('mouseover', function() {
            this.style.transform = 'translate(-4px, -4px)';
            this.style.boxShadow = '8px 8px 0 rgba(0,0,0,0.5)';
        });
        
        button.addEventListener('mouseout', function() {
            this.style.transform = 'translate(0, 0)';
            this.style.boxShadow = '4px 4px 0 rgba(0,0,0,0.5)';
        });
    });

    // 像素文字悬停效果
    document.querySelectorAll('.pixel-text').forEach(text => {
        text.addEventListener('mouseover', function() {
            this.style.textShadow = '6px 6px 0 rgba(0,0,0,0.5)';
        });
        
        text.addEventListener('mouseout', function() {
            this.style.textShadow = '4px 4px 0 rgba(0,0,0,0.5)';
        });
    });

    // 移动端菜单切换
    const menuButton = document.querySelector('.menu-button');
    const mainNav = document.querySelector('.main-nav');

    if (menuButton) {
        menuButton.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }

    // 特性卡片进入视口时的动画
    const featureObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        featureObserver.observe(card);
    });

    // 随机生成披萨表情
    function createRandomPizza() {
        const emojis = ['🍕', '🍕', '🍕'];
        const container = document.querySelector('.floating-pizzas');
        const emoji = document.createElement('div');
        emoji.className = 'pizza-emoji';
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.style.left = Math.random() * 100 + '%';
        emoji.style.top = Math.random() * 100 + '%';
        container.appendChild(emoji);
        
        setTimeout(() => {
            emoji.remove();
        }, 6000);
    }

    // 每3秒生成一个新的披萨表情
    setInterval(createRandomPizza, 3000);

    // 钱包连接功能
    function connectWallet() {
        alert('Connecting to wallet...');
        // 这里添加实际的钱包连接逻辑
    }

    // 添加键盘导航支持
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
            const activeChapter = document.querySelector('.chapter.active');
            if (activeChapter) {
                const currentChapterNumber = parseInt(activeChapter.id.replace('chapter', ''));
                if (currentChapterNumber < 3) {
                    showNextChapter(currentChapterNumber + 1);
                }
            }
        } else if (e.key === 'ArrowLeft') {
            const activeChapter = document.querySelector('.chapter.active');
            if (activeChapter) {
                const currentChapterNumber = parseInt(activeChapter.id.replace('chapter', ''));
                if (currentChapterNumber > 1) {
                    showNextChapter(currentChapterNumber - 1);
                }
            }
        }
    });
});
