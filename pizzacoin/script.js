// 等待DOM加载完成
document.addEventListener("DOMContentLoaded", () => {
    // 物理移动披萨
    const pizza = document.querySelector('#physics-pizza');
    if (!pizza) {
        console.error('找不到物理移动披萨元素');
        return;
    }

    // 物理参数
    let posX = window.innerWidth / 2;
    let posY = window.innerHeight / 2;
    let velocityX = 3;  // 初始水平速度
    let velocityY = 3;  // 初始垂直速度
    const targetSpeed = 3;  // 目标速度

    function updatePizza() {
        // 更新位置
        posX += velocityX;
        posY += velocityY;
        
        // 获取窗口尺寸
        const pizzaRect = pizza.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // 碰撞检测
        if (posX <= 0) {
            posX = 0;
            velocityX = Math.abs(velocityX);  // 向右反弹
        } else if (posX + pizzaRect.width >= windowWidth) {
            posX = windowWidth - pizzaRect.width;
            velocityX = -Math.abs(velocityX);  // 向左反弹
        }

        if (posY <= 0) {
            posY = 0;
            velocityY = Math.abs(velocityY);  // 向下反弹
        } else if (posY + pizzaRect.height >= windowHeight) {
            posY = windowHeight - pizzaRect.height;
            velocityY = -Math.abs(velocityY);  // 向上反弹
        }

        // 计算旋转角度，使披萨跟随运动方向
        const rotation = Math.atan2(velocityY, velocityX) * (180 / Math.PI);
        
        // 应用变换
        pizza.style.transform = `translate(${posX}px, ${posY}px) rotate(${rotation}deg)`;
        
        // 继续动画
        requestAnimationFrame(updatePizza);
    }

    // 开始动画
    updatePizza();

    // 窗口大小改变时重置位置
    window.addEventListener('resize', () => {
        posX = Math.min(posX, window.innerWidth - pizza.getBoundingClientRect().width);
        posY = Math.min(posY, window.innerHeight - pizza.getBoundingClientRect().height);
    });

    // 倒计时功能
    function updateCountdown() {
        const pizzaDay = new Date('2024-05-22T00:00:00');
        const now = new Date();
        const diff = pizzaDay - now;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('timer').textContent = 
            `${days}天 ${hours}小时 ${minutes}分 ${seconds}秒`;
    }

    // 每秒更新倒计时
    setInterval(updateCountdown, 1000);
    updateCountdown();

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
});
